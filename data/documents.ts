export type Document = {
  id: string;
  name: string;
  size: string;
  url: string;
  lastUpdate: string; //formato ISO 8601 (esempio "2024-04-10T11:30:00Z" // UTC ----- "2024-04-10T11:30:00+02:00" // Offset specifico del fuso orario (CEST))
};
export type Documents = Record<string, Document[]>;

export const documents = {

  "propulsione_diesel": [
    {
      id: "pdf_test_1",
      name: "PDF Test.pdf",
      size: "1.1 mb",
      url: 'https://www.orimi.com/pdf-test.pdf',
      lastUpdate: "2024-05-09T02:36:00+02:00",
    },
    {
      id: "pdf_test_2",
      name: "PDF Test 2.pdf",
      size: "1.1 mb",
      url: 'https://www.orimi.com/pdf-test.pdf',
      lastUpdate: "2024-05-09T02:36:00+02:00",
    },
  ]
  // "propulsione_diesel": [
  //   //local
  //   {
  //     id: "xr_naval_maintenance",
  //     name: "XR NAVAL MAINTENANCE.docx",
  //     size: "1.1 mb",
  //     url: '@/assets/documents/XR NAVAL MAINTENANCE.docx',
  //     lastUpdate: "2024-05-09T02:36:00+02:00",
  //   },
  //   {
  //     id: "relazione_birex",
  //     name: "RELAZIONE-BIREX.pdf",
  //     size: "890 kb",
  //     url: '@/assets/documents/RELAZIONE-BIREX.pdf',
  //     lastUpdate: "2024-04-18T02:36:00+02:00",
  //   },

  //   {
  //     id: "part_numbers_scheme",
  //     name: "Part_numbers_scheme.pdf",
  //     size: "12.2 mb",
  //     url: '@/assets/documents/Part_numbers_scheme.pdf',
  //     lastUpdate: "2024-04-22T02:36:00+02:00",
  //   },
  //   //cloud
  //   {
  //     id: "file-example_PDF_500_kB",
  //     name: "file-example_PDF_500_kB.pdf",
  //     size: "12.2 mb",
  //     url: "https://file-examples.com/storage/fe5b2d7509679251797a850/2017/10/file-example_PDF_500_kB.pdf",
  //     lastUpdate: "2024-04-22T02:36:00+02:00",
  //   },
  //   {
  //     id: "file-sample_100kB",
  //     name: "file-sample_100kB.docx",
  //     size: "12.2 mb",
  //     url: "https://file-examples.com/wp-content/storage/2017/02/file-sample_100kB.docx",
  //     lastUpdate: "2024-04-22T02:36:00+02:00",
  //   },
  //   {
  //     id: "file-sample_1MB",
  //     name: "file-sample_1MB.doc",
  //     size: "12.2 mb",
  //     url: "https://file-examples.com/wp-content/storage/2017/02/file-sample_1MB.doc",
  //     lastUpdate: "2024-04-22T02:36:00+02:00",
  //   },
  // ]
};
