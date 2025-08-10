# Família Chat (PWA + Firebase)

App de chat super simples (estilo WhatsApp) para sua família, com envio de imagens.
- Front-end estático (pode hospedar no GitHub Pages).
- Backend com Firebase (Auth anônima, Realtime Database e Storage).
- Instalável em Android e iPhone (PWA).

## Como usar

1. **Crie um projeto Firebase** (ou reutilize o seu).
2. Ative:
   - Authentication → **Sign-in method** → **Anonymous**: Enable.
   - Realtime Database → **Create** → modo bloqueado → depois aplique as **Rules** abaixo.
   - Storage → **Rules** abaixo.
3. Copie o `firebaseConfig` do seu projeto (Settings → Project settings → "Your apps") e **cole em `app.js`**.
4. Faça deploy no **GitHub Pages** (ou qualquer hospedagem estática).
5. Abra no celular e **"Adicionar à tela de início"** para instalar como app.

## Regras de Segurança (sugestão)

**Realtime Database (`Rules`):**
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "rooms": {
      "$room": {
        "messages": {
          "$msg": {
            ".write": "auth != null && newData.child('uid').val() === auth.uid"
          }
        }
      }
    }
  }
}
```

**Storage (`Rules`):**
```java
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{uid}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

> Ajuste as regras conforme a sua necessidade.

## Configuração do `firebaseConfig`

No arquivo `app.js`, substitua:
```js
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Pelo config real do seu projeto.

## Dica: Código da Família (Sala)

Na tela inicial, informe um **código da família**, por exemplo `PORTILHO`. Todos que entrarem com o mesmo código conversam na **mesma sala**.

## Build/Deploy no GitHub Pages

- Suba estes arquivos num repositório.
- Em **Settings → Pages**, selecione a branch (ex: `main`) e a pasta `/ (root)`.
- Aguarde publicar e acesse a URL.

## iPhone (iOS)

- Abra no Safari, toque em **Compartilhar → Adicionar à Tela de Início**.
- O ícone e o nome virão do `manifest.json`.

## Android

- Abra no Chrome; você verá o prompt ou opção de **Instalar app**.

## Personalizações rápidas

- Estilo: edite `styles.css`.
- Ícone: substitua `icon-192.png` e `icon-512.png`.
- Limite de mensagens carregadas: em `app.js` altere `limitToLast(200)`.

---

Qualquer coisa me chama que a gente ajusta 😉