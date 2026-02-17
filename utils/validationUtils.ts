export const validateEmail = (email: string) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // Controllo che l'email non sia vuota
  if (!email || email.trim() === "") {
    return { isValid: false, message: "L'email non può essere vuota." };
  }

  // Controllo che l'email contenga il simbolo @
  if (!email.includes("@")) {
    return { isValid: false, message: "L'email deve contenere il simbolo '@'." };
  }

  // Controllo formato complessivo con regex
  if (!emailRegex.test(String(email).toLowerCase())) {
    return { isValid: false, message: "L'email non è valida. Controlla il formato." };
  }

  // Se tutti i controlli passano
  return { isValid: true, message: "Email valida." };
};

export const validateTelephone = (telephone: string) => {

  /* DA DEFINIRE con eventuale prefisso nazionale */
  return { isValid: true, message: "Numero di telefono valido." };
  const regex = /^\d{10}$/; // RegEx per un numero di telefono di 10 cifre

  // Controllo che il numero di telefono non sia vuoto
  if (!telephone || telephone.trim() === "") {
    return { isValid: false, message: "Il numero di telefono non può essere vuoto." };
  }

  // Controllo che il numero contenga solo cifre
  if (!/^\d+$/.test(telephone)) {
    return { isValid: false, message: "Il numero di telefono deve contenere solo cifre." };
  }

  // Controllo della lunghezza esatta (esempio: 10 cifre)
  if (!regex.test(telephone)) {
    return {
      isValid: false,
      message: "Il numero di telefono deve essere composto da 10 cifre.",
    };
  }

  // Se tutti i controlli passano
  return { isValid: true, message: "Numero di telefono valido." };
};

export const validateName = (name: string) => {
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'’\- ]+$/;

  // Controllo che il nome non sia vuoto
  if (!name || name.trim() === "") {
    return { isValid: false, message: "Il nome non può essere vuoto." };
  }

  // Controllo che il nome non termini con spazi
  if (/\s$/.test(name)) {
    return { isValid: false, message: "Il nome non può terminare con spazi." };
  }

  // Controllo che il nome non sia troppo corto
  if (name.trim().length < 2) {
    return { isValid: false, message: "Il nome deve contenere almeno 2 caratteri." };
  }

  // Controllo che il nome contenga solo caratteri validi
  if (!nameRegex.test(name.trim())) {
    return {
      isValid: false,
      message: "Il nome può contenere solo lettere, spazi, apostrofi e trattini.",
    };
  }

  // Se tutti i controlli passano
  return { isValid: true, message: "Nome valido." };
};

export const validateCleanField = (text: string) => {

  if (!text || text.trim() === "") {
    return { isValid: false, message: "Il campo non può essere vuoto." };
  }
  if (/\s$/.test(text)) {
    return { isValid: false, message: "Il campo non può terminare con spazi." };
  }
  
  return { isValid: true, message: "Campo valido." };
};

export const validateCustomField = (fieldName: string, compareValues: string[]) => {
  const cleanValidation = validateCleanField(fieldName);
  if (!cleanValidation.isValid) {
    return cleanValidation;
  }

  const normalized = fieldName.trim().toLowerCase();
  const isDuplicate = compareValues.some(val => val.trim().toLowerCase() === normalized);

  if (isDuplicate) {
    return { isValid: false, message: "Questo nome di campo è già utilizzato." };
  }

  return { isValid: true, message: "Campo valido." };
};



export const validatePassword = (password: string) => {
  // Controllo della lunghezza minima
  if (password.length < 8) {
    return { isValid: false, message: "La password deve contenere almeno 8 caratteri." };
  }

  // Controllo presenza di almeno una lettera maiuscola
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "La password deve contenere almeno una lettera maiuscola." };
  }

  // Controllo presenza di almeno un numero
  if (!/\d/.test(password)) {
    return { isValid: false, message: "La password deve contenere almeno un numero." };
  }

  // Controllo presenza di un carattere speciale
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "La password deve contenere almeno un carattere speciale." };
  }

  return { isValid: true, message: "Password valida." };
};

export const validateConfirmPassword = (password: string, comparePassword: string) => {
  /* if (!password || comparePassword.trim() === "") {
    return { isValid: false, message: "La conferma della password non può essere vuota." };
  } */
  if (password !== comparePassword) {
    return { isValid: false, message: "La password di conferma non corrisponde alla nuova password." };
  }
  return { isValid: true, message: "Le password corrispondono." };
};

export const validateOldPassword = (password: string, comparePassword: string) => {
  if (password !== comparePassword) {
    return { isValid: false, message: "La password inserita non corrisponde a quella correntemente in uso." };
  }
  return { isValid: true, message: "Le password corrispondono." };
};

export const validatePin = (pin: string) => {
  // Controllo della lunghezza minima e massima (4 o 6 caratteri)
  if (pin.length !== 4 && pin.length !== 6) {
    return { isValid: false, message: "Il PIN deve essere composto da 4 o 6 cifre." };
  }

  // Controllo che il PIN contenga solo numeri
  if (!/^\d+$/.test(pin)) {
    return { isValid: false, message: "Il PIN può contenere solo numeri." };
  }

  // Controllo che il PIN non sia composto interamente da cifre uguali (es: 1111 o 0000)
  if (/^(\d)\1+$/.test(pin)) {
    return { isValid: false, message: "Il PIN non può essere composto da cifre tutte uguali." };
  }

  // Controllo che il PIN non sia sequenziale (es: 1234 o 4321)
  if (
    "0123456789".includes(pin) || // Sequenza crescente
    "9876543210".includes(pin) // Sequenza decrescente
  ) {
    return { isValid: false, message: "Il PIN non può essere una sequenza numerica." };
  }

  return { isValid: true, message: "PIN valido." };
};

export const validateConfirmPIN = (PIN: string, comparePIN: string) => {
  /* if (!password || comparePassword.trim() === "") {
      return { isValid: false, message: "La conferma della password non può essere vuota." };
    } */
  if (PIN !== comparePIN) {
    return { isValid: false, message: "I PIN non corrispondono." };
  }
  return { isValid: true, message: "I PIN corrispondono." };
};

export const validateLicense = (license: string) => {
  const licenseRegex = /^[A-Z0-9]{14}$/; // 14 caratteri, solo lettere maiuscole e numeri

  if (!license || license.trim() === "") {
    return { isValid: false, message: "La licenza non può essere vuota." };
  }

  if (license.length !== 14) {
    return {
      isValid: false,
      message: "La licenza deve contenere esattamente 14 caratteri.",
    };
  }

  if (!licenseRegex.test(license)) {
    return {
      isValid: false,
      message: "La licenza può contenere solo lettere maiuscole e numeri.",
    };
  }

  return { isValid: true, message: "Licenza valida." };
};

