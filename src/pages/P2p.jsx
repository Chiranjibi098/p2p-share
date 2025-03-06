import React, { useState, useRef, useEffect } from "react";
import { Peer } from "peerjs";
import useWebSocket from "react-use-websocket";
import "../assets/css/P2p.css";

const SOCKET_URL = import.meta.env.REACT_APP_SOCKET_URL;

function Home() {
  const [peerId, setPeerId] = useState("");
  const [remoteId, setRemoteId] = useState("");
  const [connected, setConnected] = useState(false);
  const [receivedImage, setReceivedImage] = useState(null); // State to store received image URL
  const peer = useRef(null);
  const connection = useRef(null);
  const fileInput = useRef(null);

  // WebSocket hook
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(SOCKET_URL, {
    onOpen: () => console.log("Connected to WebSocket"),
    shouldReconnect: () => true,
  });

  useEffect(() => {
    peer.current = new Peer();

    peer.current.on("open", (id) => {
      setPeerId(id);
      sendJsonMessage({ type: "register", id });
    });

    peer.current.on("connection", (conn) => {
      connection.current = conn;
      setConnected(true);

      conn.on("data", (data) => receiveFile(data));
    });

    return () => peer.current.destroy();
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      handleWebSocketMessage(lastJsonMessage);
    }
  }, [lastJsonMessage]);

  const handleWebSocketMessage = (message) => {
    if (message.type === "peerId") {
      setRemoteId(message.id);
    }
  };

  const connectToPeer = () => {
    if (!remoteId) return;

    connection.current = peer.current.connect(remoteId);
    connection.current.on("open", () => setConnected(true));
    connection.current.on("data", (data) => receiveFile(data));
  };

  const sendFile = () => {
    const file = fileInput.current.files[0];
    if (file && connection.current && connection.current.open) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        connection.current.send(reader.result);
      };
    }
  };

  const receiveFile = (data) => {
    const blob = new Blob([data], { type: "image/png" }); // Assuming image type is PNG
    const url = URL.createObjectURL(blob);
    setReceivedImage(url);
  };

  return (
    <div className="wrap">
      <div className="form">
        <h2>P2P File Transfer</h2>
        <p className="btn-shine">Your ID: {peerId}</p>
        <div className="PeerSec">
          <input
            type="text"
            placeholder="Enter peer ID"
            value={remoteId}
            onChange={(e) => setRemoteId(e.target.value)}
            className="Input"
          />
          <button onClick={connectToPeer} className="ConnectBtn">
            <span>Connect</span>
          </button>
        </div>

        <br />
        <div className="PeerSec">
          <input type="file" ref={fileInput} />
        </div>

        <button onClick={sendFile} disabled={!connected} className="Button" id="btn">
          <span>Send</span>
        </button>

        {/* Display received image */}
        {receivedImage && (
          <div>
            <h2>Received Image:</h2>
            <img
              src={receivedImage}
              alt="Received"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
