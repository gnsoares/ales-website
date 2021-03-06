export const phoneMask = (value) => {
  return value
    .replace(/[A-Za-z]/g, "")
    .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    .replace(/(-\d{4})\d+?$/, "$1");
};

export const formatPhone = (phone) => {
  return phone.replace(/[-()]/g, "").replace(/\s/g, "");
};

export const dateMask = (value) => {
  return value
    .replace(/[A-Za-z]/g, "")
    .replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3")
    .replace(/(\/\d{4})\d+?$/, "$1");
};

// considers dd/mm/aaaa format
export const formatDateToSend = (dateString) => {
  const [day, month, year] = dateString.split("/");
  return new Date(year, month - 1, day);
};

export const formatDateToReceive = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};
