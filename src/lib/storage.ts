import CryptoJS from 'crypto-js'

const SECRET_KEY = 'your-secret-key-for-encryption' // В продакшене использовать переменную окружения

export const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  } catch {
    return null
  }
}

export const saveToStorage = (key: string, data: any) => {
  const encrypted = encryptData(data)
  localStorage.setItem(key, encrypted)
}

export const loadFromStorage = (key: string): any => {
  const encrypted = localStorage.getItem(key)
  if (!encrypted) return null
  return decryptData(encrypted)
}