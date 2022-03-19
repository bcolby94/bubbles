let socket;

const emitPost = () => {
  if (socket.readyState !== 1) {
      alert("Socket not connected. Please try again.");
  }
  const message = document.getElementById('content').value;
  document.getElementById('content').value = '';
  socket.send([message]);
};

document.querySelector('#chatbar').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    emitPost();
  }
});

const init = () => {
  // websocket
  socket = new WebSocket('ws://' + location.host);
  // Log errors to the console for debugging.
  socket.onerror = function(error) {
    console.log(error);
  };
  // Reconnect upon disconnect.
  socket.onclose = function() {
    console.log(`Your socket has been disconnected. Attempting to reconnect...`);
    setTimeout(function() {
      init();
    }, 1000);
  };
  socket.onmessage = (message) => {
    const parsedData = JSON.parse(message.data);

    /* Inserts regular messages into DOM */
    if (parsedData.alert) {
      const num = Math.floor((Math.random() * 10) + 1);
      const areaNum = `x${num}`;
      const areaDOM = document.getElementById(areaNum);
      document.getElementById(areaNum).innerHTML = ``;
      areaDOM.textContent = parsedData.alert;
      msg = new SpeechSynthesisUtterance();
      msg.text = parsedData.alert;
      window.speechSynthesis.speak(msg);
    }
    /* End */

    /* Inserts video messages into DOM */
    if (parsedData.html) {
      newVideo = parsedData.html;
      const num = Math.floor((Math.random() * 10) + 1);
      const areaNum = `x${num}`;
      const container = document.createElement('div');
      container.setAttribute('id', newVideo);
      videoLink = `https://www.youtube.com/embed/${newVideo}?autoplay=1`;
      container.innerHTML = `
        <iframe height="100%" width="100%" src="${videoLink}" allow="autoplay; encrypted-media" allowfullscreen />
      `;
      document.getElementById(areaNum).innerHTML = ``;
      document.getElementById(areaNum).appendChild(container);
    /* End */
    }
  }

    socket.onopen = () => {
      console.log('client connected successfully');
    };
  }

init();