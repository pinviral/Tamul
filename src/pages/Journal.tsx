import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { BookOpen, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  note: string;
  createdAt: any;
}

export const Journal: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: JournalEntry[] = [];
      snapshot.forEach((doc) => {
        fetchedEntries.push({ id: doc.id, ...doc.data() } as JournalEntry);
      });
      setEntries(fetchedEntries);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'journalEntries');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await addDoc(collection(db, 'journalEntries'), {
        userId: user.uid,
        date: today,
        note: newNote.trim(),
        createdAt: serverTimestamp()
      });
      setNewNote('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'journalEntries');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    // In a real iOS app, we'd use a custom action sheet or modal instead of window.confirm
    if (!window.confirm('هل أنت متأكد من حذف هذه المذكرة؟')) return;
    try {
      await deleteDoc(doc(db, 'journalEntries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `journalEntries/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black pt-safe pb-[100px]">
      <div className="px-5 pt-8 pb-4">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 space-x-reverse mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF9500] to-[#FFCC00] flex items-center justify-center shadow-md">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <h1 className="text-[34px] font-bold text-[#1C1C1E] dark:text-white tracking-tight">مذكرتي</h1>
          </div>
          <p className="text-[15px] text-[#8E8E93] font-medium">دوّن أفكارك ومشاعرك اليومية</p>
        </motion.header>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleAddEntry} 
          className="glass-panel p-5 mb-8"
        >
          <div className="relative">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="بم تفكر اليوم؟"
              className="w-full h-32 bg-transparent border-none focus:ring-0 resize-none text-[17px] text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] leading-relaxed"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center text-[#8E8E93] text-[13px] font-medium">
              <Calendar className="w-4 h-4 ml-1.5" />
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <button
              type="submit"
              disabled={!newNote.trim() || isSubmitting}
              className="bg-[#007AFF] disabled:bg-[#007AFF]/50 text-white px-5 py-2 rounded-full text-[15px] font-semibold flex items-center space-x-1 space-x-reverse shadow-sm active:scale-95 transition-all"
            >
              <Plus size={18} />
              <span>حفظ</span>
            </button>
          </div>
        </motion.form>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => (
              <motion.div 
                key={entry.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 relative group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-[13px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2.5 py-1 rounded-md">
                      {entry.date}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-[16px] text-[#3A3A3C] dark:text-[#EBEBF5] whitespace-pre-wrap leading-relaxed">
                  {entry.note}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {entries.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 px-4"
            >
              <div className="w-20 h-20 mx-auto bg-gray-200/50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-[#8E8E93]" />
              </div>
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white mb-2">لا توجد مذكرات بعد</h3>
              <p className="text-[15px] text-[#8E8E93]">ابدأ بتدوين أفكارك ومشاعرك لتبدأ رحلتك نحو السلام الداخلي.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
