// === 1) Cole aqui a sua configuração do Firebase ===
const firebaseConfig = {
  apiKey : "AIzaSyAqKRgVySm-vGFMi_iE2HJqlDAofmEAKAI" ,
  authDomain : "listacompras-8b4b0.firebaseapp.com" ,
  databaseURL : "https://listacompras-8b4b0-default-rtdb.firebaseio.com" ,
  projectId : "listacompras-8b4b0" ,
  storageBucket : "listacompras-8b4b0.appspot.com" ,
  messagingSenderId : "729159542190" ,
  ID do aplicativo : "1:729159542190:web:bd0571be160cfd723a543f"
};

firebase.initializeApp ( firebaseConfig );
const auth = firebase.auth ( );
const db = firebase.banco de dados ();
const armazenamento = firebase. storage ();

// === 2) Elementos da interface do usuário ===
const loginBar = document.getElementById ( 'loginBar ' )
 ;
const displayNameInput = document . getElementById ( 'displayName' );
const familyCodeInput = document . getElementById ( 'familyCode' );
const enterBtn = document.getElementById ( 'enterBtn ' )
 ;

const messagesEl = document . getElementById ( 'mensagens' );
const textInput = documento . getElementById ( 'textInput' );
const sendBtn = document.getElementById ( 'sendBtn ' )
 ;
const arquivoInput = documento . getElementById ( 'fileInput' );
const userInfo = document . getElementById ( 'userInfo' );
const roomLabel = document.getElementById ( 'roomLabel '
 ) ;
const contactForm= document.getElementById ( 'contactForm ' )
 ;
const contactUidInput = document.getElementById ( 'contactUid ' )
 ;
const contactNameInput = document . getElementById ( 'contactName' );
const contactsList = document . getElementById ( 'contactsList' );

deixe currentRoom = nulo ;
deixe currentUser = nulo ;
deixe messagesRef = nulo ;
deixe contactsRef = nulo ;
deixe selectedContact = nulo ;

// === 3) Estado simples e auxiliares ===
função sanitizar ( s ) { return (s || '' ). toString (). trim (); }
 

função scrollToBottom ( );
 
  mensagensEl. scrollTop = mensagensEl. scrollHeight ;
}

função renderMessage ( msg, isMe ){
 
  const wrap = document . createElement ( 'div' );
  wrap. className = 'msg ' + (isMe ? 'me' : 'outro' );

  const bolha = documento . createElement ( 'div' );
  bolha. className = 'bolha' ;

  se (msg.imageUrl ) {
    const img = documento . createElement ( 'img' );
    img. className = 'imagem-de-chat' ;
    img. src = msg. imageUrl ;
    img.alt = msg.text || 'imagem';
    bolha. appendChild (img);
    se (mensagem de texto ){
      const t = documento . createElement ( 'div' );
      t. textContent = msg. texto ;
      bolha. appendChild (t);
    }
  } outro {
    bolha.textContent = msg. texto || ' '
 ;
  }

  const meta = documento . createElement ( 'div' );
  const time = nova data ( msg.createdAt || Data . now ());
 
  const hh = tempo.getHours (). toString (). padStart ( 2 , '0' )
 ;
  const mm = tempo.getMinutes (). toString (). padStart ( 2 , '0' ) ;
  meta.className = 'meta ' ;
  meta.textContent = (msg.name || 'Alguém') + ' — ' + hh + ':' + mm;

  wrap. appendChild (bolha);
  wrap. appendChild (meta);
  mensagensEl. appendChild (wrap);
}

função startRoom ( roomCode ){
 
  se (mensagensRef){
    mensagensRef. off ();
  }
  currentRoom = 'quartos/' + roomCode + '/mensagens' ;
  messagesRef = db. ref (currentRoom). limitToLast ( 200 );
  roomLabel. textContent = 'Sala: ' + roomCode;

  mensagensEl. innerHTML = '' ;
  mensagensRef. em ( 'criança_adicionada' , ( snap ) => {
    const msg = snap. val () || {};
    renderMessage (msg, currentUser && msg. uid === currentUser. uid );
    rolarParaBaixo ();
  });
}

função assíncrona sendText ( );
  
  const text = sanitize (textInput. valor );
  se (!texto) retornar ;
  se (!texto || !currentRoom ) retornar ;
  textInput. valor = '' ;
  carga útil constante = {
    uid : UsuárioAtual? UsuárioAtual. uid : nulo ,
    nome : localStorage . getItem ( 'displayName' ) || 'Visitante' ,
    texto,
    criado em : Data . agora ()
  };
  aguardar db. ref (currentRoom). push (carga útil);
}

função assíncrona sendImage ( arquivo ){
  
  se (!arquivo) retornar ;
  se (!arquivo || !atualSala ) retornar ;
  const name = localStorage . getItem ( 'displayName' ) || 'Visitante' ;
  const uid = currentUser ? currentUser.uid : nulo ;
  const ts = Data . now ();
  const caminho = `uploads/ ${uid || 'anon' } / ${ts} _ ${file.name} ` ;
  const snap = await storage. ref (). filho (caminho). put (arquivo);
  const url = aguarda snap. ref . getDownloadURL ();
  const payload = { uid, nome, imageUrl : url, createdAt : ts };
  aguardar db. ref (currentRoom). push (carga útil);
}

// === Gerenciamento de contatos ===
função listenContacts ( ){
 
  se (!currentUser) retornar ;
  se (contatosRef) contatosRef. desligado ();
  contactsRef = db. ref ( `usuários/ ${currentUser.uid} /contatos` );
  contactsRef. em ( 'valor' , ( snap ) => {
    const dados = snap. val () || {};
    contactsList.innerHTML = ' '
 ;
    Objeto . entradas (dados). forEach ( ( [uid, info] ) => {
      const li = documento . createElement ( 'li' );
      li. textContent = info. nome || uid;
      li. conjunto de dados . uid = uid;
      li. className = 'contato' + (uid === selectedContact ? ' selected' : '' );
      li. addEventListener ( 'clique' , () => selectContact (uid, info. nome ));
 
      contactsList. appendChild (li);
    });
    se (!contato selecionado){
      const último = localStorage . getItem ( 'últimoContato' );
      se (último && data[último]){
        selectContact (último, data[último]. nome );
      }
    }
  });
}

função selectContact ( uid, nome ){
 
  Contato selecionado = uid;
  documento . querySelectorAll ( '#contactsList li' ). forEach ( li => {
    li. classList . toggle ( 'selecionado' , li. dataset . uid === uid);
  });
  const roomId = [currentUser.uid , uid] .sort (). join ( '_' );
  roomLabel. textContent = 'Contato: ' + (nome || uid);
  localStorage . setItem ( 'últimoContato' , uid);
  startRoom (salaId);
}

contactForm. addEventListener ( 'enviar' , async (e) => {
  e. preventDefault ();
  const uid = sanitize (contactUidInput. valor );
  const nome = sanitize (contactNameInput. valor );
  se (!uid || !nome || !usuárioatual) retornar ;
  aguarde db. ref ( `usuários/ ${currentUser.uid} /contatos/ ${uid} ` ). set ({ nome });
  contactUidInput. valor = '' ;
  contactNameInput. valor = '' ;
});

// === 4) Fluxo de autenticação + entrada (anônimo) ===
enterBtn. addEventListener ( 'clique' , async () => {
  const nome = sanitize (displayNameInput. valor );
  const código = sanitize (familyCodeInput. valor ). toUpperCase ();
  se (!nome || !código){
    alert ( 'Informe seu nome e o código da família (ex: PORTILHO).' );
  se (!nome){
    alert('Informe seu nome.');
    retornar ;
  }
  localStorage . setItem ( 'displayName' , nome);
  localStorage . setItem ( 'familyCode' , código);

  tentar {
    const cred = aguardar autenticação. signInAnonymously ();
    currentUser = cred. usuário ;
    aguarde db. ref ( 'users/' + currentUser. uid ). atualização ({ displayName : nome });
    userInfo. textContent = nome;
    loginBar. style . display = 'nenhum' ;
    startRoom (código );
    ouvirContatos ( );
    textInput.foco ()
 ;
  } pegar (e){
    alert('Erro ao entrar: ' + e.message);
  }
});

auth.onAuthStateChanged ( ( u ) => {
  UsuárioAtual = u;
  const savedName = localStorage . getItem ( 'displayName' );
  const salvoCode = localStorage . getItem ( 'famíliaCode' );
  se (u && nome salvo && código salvo){
  se (u && nome salvo){
    userInfo. textContent = NomeSalvado;
    loginBar. style . display = 'nenhum' ;
    startRoom (código salvo );
    ouvirContatos ( );
  }
});

// === 5) Eventos ===
sendBtn.addEventListener ( 'clique' , sendText)
 ;
textInput.addEventListener ( 'keydown' , ( e ) => {
  se (e. tecla === 'Enter' ) enviarTexto ();
});
fileInput. addEventListener ( 'alterar' , () => {
  const arquivo = fileInput. arquivos [ 0 ];
  se (arquivo) enviarImagem (arquivo);
  fileInput. valor = '' ;
});
