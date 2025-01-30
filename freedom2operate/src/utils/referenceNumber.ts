export const generateReferenceNumber = (userId: string): string => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const prefix = 'FTO';
  const userPrefix = userId.substring(0, 4).toUpperCase();
  
  return `${prefix}-${userPrefix}-${timestamp}-${randomNum}`;
};
