
export type Failure = {
  id: string;
  title: string;
  description: string;
  date: string; // formato "YYYY-MM-DD"
  gravity: string; // es. "critica", "media", ecc. (potresti usare un'union type)
  executionUserType: string; // se hai più valori possibili, aggiornalo
  userExecution: string; // ID come stringa
  partNumber: string;
  customFields: string; //"[{\"name\":\"boh\",\"value\":\"11\"}]"
  [key: string]: any;
  ship_id: string;
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

  userExecutionData: {
    id: string;
    team_id: string;
    first_name: string;
    last_name: string;
    profile_image: string;
    phone_number: string;
    registration_date: string; // formato ISO
    bot_id_ita: string;
    bot_id_ing: string;
    bot_id_esp: string;
  } | null;
};

export const failures: Failure[] = [];
