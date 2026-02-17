export type Reading = {
  id: string;
  user_id: string;
  ship_id: string;
  task_name: string;
  eswbs_id: string;
  recurrence: string;
  value: string;
  due_date: string;
  description: string;
  tags: string[]; // già trasformati
  team: string;
  reading_type: string;
  type: {
    id: string;
    name: string;
  };
  element: {
    id: string;
    name: string;
    element_model_id: string;
    ship_id: string;
    serial_number: string;
    installation_date: string | null;
    progressive_code: string | null;
  };
  vocalNotes: Array<{
    id: string;
    failure_id: string | null;
    task_id: string;
    audio_url: string;
    created_at: string;
    author: string;
    type: string;
    status: string | null;
  }>;

  textNotes: Array<{
    id: string;
    failure_id: string | null;
    task_id: string;
    author: string;
    text_field: string;
    created_at: string;
    type: string;
    status: string | null;
  }>;

  photographicNotes: Array<{
    id: string;
    failure_id: string | null;
    task_id: string;
    image_url: string;
    author: string;
    created_at: string;
    type: string;
    status: string | null;
  }>;
};
