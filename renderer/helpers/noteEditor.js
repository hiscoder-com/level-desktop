export const generateUniqueId = (existingIds) => {
  console.log(existingIds);
  let newId;
  do {
    newId = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9);
  } while (existingIds.includes(newId));
  return newId;
};
