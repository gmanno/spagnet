export const carteiraMask = value => {
  return value
    .replace(/\D/g, "") // substitui qualquer caracter que nao seja numero por nada
    .replace(/^(\d{4})(\d)/, "$1 $2") 
    .replace(/(\d{12})(\d)/, "$1 $2");
};