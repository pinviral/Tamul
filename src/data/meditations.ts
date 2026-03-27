export interface Meditation {
  id: number;
  title: string;
  description: string;
  duration: number;
  category: 'money' | 'stress' | 'self' | 'sleep' | 'energy';
  audioUrl: string;
}

export const meditations: Meditation[] = [
  // الوفرة المالية وقانون الجذب (10 جلسات)
  { id: 1, title: "برمجة العقل الباطن للوفرة (ترددات ثيتا)", description: "جلسة عميقة تستهدف العقل اللاواعي لتفكيك المعتقدات المالية المقيدة وإعادة برمجة مسارات الوفرة والاستحقاق.", duration: 2, category: "money", audioUrl: "" },
  { id: 2, title: "فك الارتباط العاطفي بالندرة", description: "تقنية تحرر شعوري (Somatic Release) للتخلص من مشاعر الخوف والقلق المرتبطة بالمال، والانتقال لحالة التسليم.", duration: 1, category: "money", audioUrl: "" },
  { id: 3, title: "تأمل القفزة الكمية (Quantum Jumping)", description: "تمرين تخيل متقدم للاتصال بنسختك المستقبلية التي حققت الاستقلال المالي، واستمداد الحكمة والطاقة منها.", duration: 2, category: "money", audioUrl: "" },
  { id: 4, title: "تنظيف شاكرا الجذر للأمان المالي", description: "تأمل موجه لموازنة مركز الأمان والبقاء في الجسد، مما يعزز الشعور بالاستقرار المادي والقدرة على كسب المال.", duration: 2, category: "money", audioUrl: "" },
  { id: 5, title: "قانون الجذب: توكيدات الاستحقاق العالي", description: "جلسة توكيدات مدروسة علمياً لرفع ذبذبات الاستحقاق وتفعيل قانون الجذب لصالح أهدافك المالية.", duration: 1, category: "money", audioUrl: "" },
  { id: 6, title: "التصالح مع طاقة المال", description: "المال هو طاقة محايدة. هذه الجلسة تساعدك على بناء علاقة صحية وإيجابية مع المال بعيداً عن مشاعر الذنب.", duration: 2, category: "money", audioUrl: "" },
  { id: 7, title: "تأمل الامتنان المغناطيسي", description: "ممارسة الامتنان العميق لما تملكه الآن لخلق حقل مغناطيسي يجذب المزيد من النعم والفرص المالية.", duration: 1, category: "money", audioUrl: "" },
  { id: 8, title: "إزالة بلوكات الرزق (Energy Clearing)", description: "جلسة تنظيف طاقي لإزالة العوائق غير المرئية التي تمنع تدفق الرزق والفرص إلى حياتك.", duration: 2, category: "money", audioUrl: "" },
  { id: 9, title: "تفعيل طاقة الاستقبال", description: "الكثير منا يجيد العطاء ويرفض الاستقبال. تأمل لفتح مسارات الاستقبال الكوني للسماح بالوفرة بالدخول.", duration: 1, category: "money", audioUrl: "" },
  { id: 10, title: "نوايا الثراء الصباحية", description: "تأمل قصير وقوي لضبط نية اليوم نحو الوفرة، واقتناص الفرص المالية بوعي وحضور.", duration: 1, category: "money", audioUrl: "" },

  // التخلص من التوتر والتفكير المفرط (5 جلسات)
  { id: 11, title: "تحفيز العصب الحائر (Vagus Nerve)", description: "تقنيات تنفس علمية (4-7-8) مدمجة مع التأمل لتحفيز الجهاز العصبي الباراسمبثاوي وإيقاف استجابة القتال أو الهرب فوراً.", duration: 2, category: "stress", audioUrl: "" },
  { id: 12, title: "إيقاف التفكير المفرط (Overthinking)", description: "تأمل التجذر (Grounding) لسحب الطاقة من العقل المزدحم بالأفكار إلى الجسد واللحظة الحالية.", duration: 2, category: "stress", audioUrl: "" },
  { id: 13, title: "التنظيف العاطفي لنهاية اليوم", description: "جلسة لتفريغ الشحنات السلبية والتوتر المتراكم خلال اليوم، لضمان عدم انتقالها معك إلى يومك التالي.", duration: 1, category: "stress", audioUrl: "" },
  { id: 14, title: "إدارة نوبات القلق (Panic Relief)", description: "إسعاف أولي نفسي: جلسة قصيرة وموجهة لاستعادة السيطرة على الأنفاس وتهدئة ضربات القلب عند الشعور بالهلع.", duration: 1, category: "stress", audioUrl: "" },
  { id: 15, title: "تأمل الانفصال عن المشاعر", description: "تدريب ذهني لمراقبة المشاعر المزعجة دون التماهي معها، لتصبح المراقب الهادئ لعواصفك الداخلية.", duration: 2, category: "stress", audioUrl: "" },

  // التشافي وحب الذات (5 جلسات)
  { id: 16, title: "تشافي الطفل الداخلي (Inner Child)", description: "رحلة عميقة للاتصال بنسختك الطفولية، تقديم الدعم العاطفي المفقود، وتحرير الصدمات القديمة المكبوتة.", duration: 2, category: "self", audioUrl: "" },
  { id: 17, title: "القبول الجذري (Radical Acceptance)", description: "تأمل مبني على العلاج السلوكي الجدلي (DBT) لتقبل الذات والواقع كما هو، دون مقاومة أو جلد للذات.", duration: 2, category: "self", audioUrl: "" },
  { id: 18, title: "دمج الظل (Shadow Work)", description: "جلسة متقدمة للتعرف على الجوانب المرفوضة من شخصيتك وتقبلها، للوصول إلى السلام الداخلي والكمال النفسي.", duration: 2, category: "self", audioUrl: "" },
  { id: 19, title: "إعادة بناء الثقة بالنفس", description: "توكيدات وتخيل موجه لترميم الصورة الذاتية، وإسكات صوت الناقد الداخلي القاسي.", duration: 2, category: "self", audioUrl: "" },
  { id: 20, title: "تأمل مسامحة الذات والآخرين", description: "عملية تحرر عاطفي لفك قيود الغضب والاستياء، لأن التسامح هو هدية تقدمها لسلامك النفسي أولاً.", duration: 2, category: "self", audioUrl: "" },

  // النوم العميق والأرق (5 جلسات)
  { id: 21, title: "يوجا نيدرا للنوم العميق (Yoga Nidra)", description: "استرخاء واعي عميق يعادل ساعات من النوم الطبيعي. يرشدك للوصول إلى حالة ما بين اليقظة والنوم.", duration: 2, category: "sleep", audioUrl: "" },
  { id: 22, title: "الراحة العميقة بدون نوم (NSDR)", description: "بروتوكول علمي لتهدئة الدماغ وتصفية الذهن، ممتاز لمن يعانون من الأرق وصعوبة الدخول في النوم.", duration: 2, category: "sleep", audioUrl: "" },
  { id: 23, title: "مسح الجسد التام (Body Scan)", description: "توجيه الانتباه لكل عضلة في الجسد لإطلاق التوتر الجسدي المخزن الذي يمنع الاستغراق في النوم.", duration: 2, category: "sleep", audioUrl: "" },
  { id: 24, title: "إسكات ضجيج العقل قبل النوم", description: "تأمل لتفريغ الأفكار المتبقية من اليوم، وإغلاق 'النوافذ المفتوحة' في الدماغ استعداداً للراحة.", duration: 2, category: "sleep", audioUrl: "" },
  { id: 25, title: "ترددات دلتا للشفاء أثناء النوم", description: "جلسة مصممة لتهيئتك للدخول في موجات دلتا الدماغية، حيث يحدث التشافي الجسدي والنفسي العميق.", duration: 2, category: "sleep", audioUrl: "" },

  // الطاقة والتركيز (5 جلسات)
  { id: 26, title: "ديتوكس الدوبامين الذهني", description: "جلسة لإعادة ضبط مستقبلات الدوبامين في الدماغ، وتقليل الحاجة للمشتتات السريعة، لزيادة القدرة على التركيز.", duration: 2, category: "energy", audioUrl: "" },
  { id: 27, title: "الدخول في حالة التدفق (Flow State)", description: "تأمل ما قبل العمل لتهيئة العقل للدخول في حالة التركيز العميق والإنتاجية العالية دون مجهود.", duration: 1, category: "energy", audioUrl: "" },
  { id: 28, title: "شحن الطاقة الصباحية (Morning Priming)", description: "مزيج من التنفس السريع والتخيل الإيجابي لرفع مستويات الطاقة وتحديد نية واضحة وقوية لليوم.", duration: 1, category: "energy", audioUrl: "" },
  { id: 29, title: "تأمل الحضور الذهني (Mindfulness)", description: "تدريب العقل على البقاء في اللحظة الحالية، مما يقلل التشتت ويزيد من حدة الانتباه والذاكرة.", duration: 2, category: "energy", audioUrl: "" },
  { id: 30, title: "إعادة الضبط في منتصف اليوم", description: "فاصل ذهني سريع لتنظيف العقل من إرهاق العمل، وتجديد النشاط للنصف الثاني من اليوم.", duration: 1, category: "energy", audioUrl: "" }
];
