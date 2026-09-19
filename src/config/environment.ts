const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("A variável EXPO_PUBLIC_API_URL não foi definida.");
}

export const environment = {
  apiUrl: apiUrl.replace(/\/+$/, "")
};
