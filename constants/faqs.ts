export interface FaqItem {
  title: string;
  body: string;
  link?: string;
  list?: string[];
}

export const therapyFaqs: (link: string) => Array<FaqItem> = (link) => [
  {
    title: 'faqTitle0',
    body: 'faqBody0',
  },
  {
    title: 'faqTitle1',
    body: 'faqBody1',
  },
  {
    title: 'faqTitle2',
    body: 'faqBody2',
  },
  {
    title: 'faqTitle3',
    body: 'faqBody3',
  },
  {
    title: 'faqTitle4',
    body: 'faqBody4',
  },
  {
    title: 'faqTitle5',
    body: 'faqBody5',
  },
  {
    title: 'faqTitle6',
    body: 'faqBody6',
    link,
  },
  {
    title: 'faqTitle7',
    body: 'faqBody7',
  },
  {
    title: 'faqTitle8',
    body: 'faqBody8',
  },
  {
    title: 'faqTitle9',
    body: 'faqBody9',
    link,
  },
  {
    title: 'faqTitle10',
    body: 'faqBody10',
  },
  {
    title: 'faqTitle11',
    body: 'faqBody11',
  },
  {
    title: 'faqTitle12',
    body: 'faqBody12',
    list: [
      'faqList12Item1',
      'faqList12Item2',
      'faqList12Item3',
      'faqList12Item4',
      'faqList12Item5',
      'faqList12Item6',
      'faqList12Item7',
      'faqList12Item8',
    ],
  },
  {
    title: 'faqTitle13',
    body: 'faqBody13',
    link,
  },
];
