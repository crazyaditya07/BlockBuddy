import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Load the contract address from environment variables (e.g. VITE_CONTRACT_ADDRESS)
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";

const contractABI = [
  "function postMessage(string memory _content) public",
  "function getMessageCount() public view returns (uint256)",
  "function getMessage(uint256 index) public view returns (address, string memory, uint256)"
];

function App() {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(() => {
    return localStorage.getItem("blockbuddy_contract_address") || contractAddress;
  });
  const [leavesParticles, setLeavesParticles] = useState([]);
  const containerRef = useRef(null);

  // Load initial simulated posts if any
  useEffect(() => {
    const isLocalSim = localStorage.getItem("blockbuddy_sim") === "true";
    setIsSimulated(isLocalSim);

    if (isLocalSim || !window.ethereum) {
      const stored = localStorage.getItem("blockbuddy_posts");
      if (stored) {
        setPosts(JSON.parse(stored));
      } else {
        const initialMock = [
          { sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", content: "🌱 Welcome to BlockBuddy! Connect MetaMask or write local messages.", timestamp: Date.now() / 1000 - 3600 },
          { sender: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", content: "🌲 Let's plant some messages on the private blockchain to grow this forest!", timestamp: Date.now() / 1000 - 1800 }
        ];
        setPosts(initialMock);
        localStorage.setItem("blockbuddy_posts", JSON.stringify(initialMock));
      }
      setIsSimulated(true);
    } else {
      checkConnection();
    }
  }, []);

  // Connect check
  const checkConnection = async () => {
    if (window.ethereum && !isSimulated) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          fetchBlockchainMessages();
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    }
  };

  // Watch address & account changes to fetch messages
  useEffect(() => {
    if (currentAddress && account && !isSimulated) {
      fetchBlockchainMessages();
    }
  }, [currentAddress, account, isSimulated]);

  // Fetch messages from Ganache Blockchain
  const fetchBlockchainMessages = async () => {
    if (!window.ethereum || !currentAddress) return;
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(currentAddress, contractABI, provider);
      const countBig = await contract.getMessageCount();
      const count = Number(countBig);
      
      const loadedPosts = [];
      for (let i = 0; i < count; i++) {
        const [sender, content, timestamp] = await contract.getMessage(i);
        loadedPosts.push({
          sender,
          content,
          timestamp: Number(timestamp)
        });
      }
      // Sort newest first
      loadedPosts.sort((a, b) => b.timestamp - a.timestamp);
      setPosts(loadedPosts);
    } catch (error) {
      console.error("Failed to fetch blockchain messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect MetaMask to Ganache
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsSimulated(false);
        localStorage.setItem("blockbuddy_sim", "false");
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        // Switch to the custom/default address to load messages
        fetchBlockchainMessages();
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask not detected. We have enabled local simulation mode so you can interact with the app!");
      setIsSimulated(true);
      localStorage.setItem("blockbuddy_sim", "true");
    }
  };

  // Switch between simulated local sandbox and real MetaMask
  const toggleSimulationMode = () => {
    const nextMode = !isSimulated;
    setIsSimulated(nextMode);
    localStorage.setItem("blockbuddy_sim", String(nextMode));
    
    if (nextMode) {
      setAccount("0xLocalSimulatedAccountAddress");
      const stored = localStorage.getItem("blockbuddy_posts");
      if (stored) {
        setPosts(JSON.parse(stored));
      }
    } else {
      setAccount(null);
      setPosts([]);
      connectWallet();
    }
  };

  const handleAddressChange = (e) => {
    const addr = e.target.value.trim();
    setCurrentAddress(addr);
    localStorage.setItem("blockbuddy_contract_address", addr);
  };

  // User posts a message
  const handlePost = async () => {
    if (!message.trim()) return;

    triggerLeafFall();

    if (isSimulated) {
      const newPost = {
        sender: account || "0xSimulatedUserAccount",
        content: message,
        timestamp: Date.now() / 1000
      };
      const updated = [newPost, ...posts];
      setPosts(updated);
      localStorage.setItem("blockbuddy_posts", JSON.stringify(updated));
      setMessage("");
      return;
    }

    if (!account) {
      alert("Please connect your wallet first or toggle simulation mode!");
      return;
    }

    if (!currentAddress) {
      alert("Please specify the deployed contract address below first!");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(currentAddress, contractABI, signer);

    try {
      setIsLoading(true);
      const tx = await contract.postMessage(message);
      await tx.wait();
      setMessage("");
      fetchBlockchainMessages();
    } catch (error) {
      console.error(error);
      alert("Failed to post message. Make sure your contract is deployed and your MetaMask is on the Ganache Network (http://127.0.0.1:7545, ID: 1337)");
    } finally {
      setIsLoading(false);
    }
  };

  // Visual leaf particles effect
  const triggerLeafFall = () => {
    const leaves = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10, // random offset percentage
      delay: Math.random() * 0.5,
      rotate: Math.random() * 360
    }));
    setLeavesParticles(prev => [...prev, ...leaves]);
    setTimeout(() => {
      setLeavesParticles(prev => prev.filter(l => !leaves.find(nl => nl.id === l.id)));
    }, 3000);
  };

  // Helper to render tree branches/leaves based on message count
  const renderTreeSVG = () => {
    const count = posts.length;
    // We determine branch count and leaf count based on number of messages
    const treeStages = {
      trunkHeight: Math.min(100 + count * 5, 160),
      branchCount: Math.min(Math.floor(count / 2), 6),
      leafCount: Math.min(count * 3, 40)
    };

    // Calculate leaf nodes
    const leaves = [];
    const seed = 42; // static seed for leaf random positions
    for (let i = 0; i < treeStages.leafCount; i++) {
      // Deterministic positions radiating from the branch endpoints
      const angle = (i * 137.5) * (Math.PI / 180); // Golden angle
      const radius = Math.min(20 + i * 2, 70);
      const cx = 160 + Math.cos(angle) * radius;
      const cy = (280 - treeStages.trunkHeight) + Math.sin(angle) * (radius * 0.6) - 15;
      leaves.push({ cx, cy, id: i });
    }

    return (
      <svg className="tree-svg" viewBox="0 0 320 280">
        {/* Ground */}
        <line x1="20" y1="270" x2="300" y2="270" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Roots */}
        {count > 0 && (
          <path d="M 160 270 Q 145 278 120 278 M 160 270 Q 175 278 200 278" stroke="var(--text-muted)" strokeWidth="2" fill="none" opacity="0.6" />
        )}
        
        {/* Trunk */}
        <line 
          x1="160" 
          y1="270" 
          x2="160" 
          y2={280 - treeStages.trunkHeight} 
          className="trunk" 
          strokeWidth={Math.min(4 + count * 0.5, 12)}
        />
        
        {/* Branches */}
        {treeStages.branchCount > 0 && (
          <>
            <path d={`M 160 ${240 - treeStages.trunkHeight/3} Q 130 ${200 - treeStages.trunkHeight/2} 110 ${180 - treeStages.trunkHeight/2}`} className="branch" strokeWidth="3" fill="none" />
            <path d={`M 160 ${220 - treeStages.trunkHeight/2} Q 190 ${180 - treeStages.trunkHeight/2} 210 ${160 - treeStages.trunkHeight/2}`} className="branch" strokeWidth="2.5" fill="none" />
          </>
        )}
        {treeStages.branchCount > 3 && (
          <>
            <path d={`M 160 ${200 - treeStages.trunkHeight/1.5} Q 140 ${160 - treeStages.trunkHeight/1.5} 125 ${140 - treeStages.trunkHeight/1.5}`} className="branch" strokeWidth="2" fill="none" />
            <path d={`M 160 ${190 - treeStages.trunkHeight/1.5} Q 180 ${150 - treeStages.trunkHeight/1.5} 195 ${130 - treeStages.trunkHeight/1.5}`} className="branch" strokeWidth="2" fill="none" />
          </>
        )}

        {/* Leaves */}
        {leaves.map((l) => (
          <path 
            key={l.id}
            d={`M ${l.cx} ${l.cy} C ${l.cx - 8} ${l.cy - 12}, ${l.cx + 8} ${l.cy - 12}, ${l.cx} ${l.cy}`}
            className="leaf" 
            title={`Leaf #${l.id + 1}`}
          />
        ))}

        {/* Seedling (if count is 0) */}
        {count === 0 && (
          <g>
            <circle cx="160" cy="265" r="4" fill="var(--accent-light)" />
            <path d="M 160 265 Q 163 258 168 258" stroke="var(--accent-light)" strokeWidth="1.5" fill="none" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="app-wrapper" ref={containerRef}>
      <div className="ambient-glow" />

      {/* Falling leaves canvas */}
      {leavesParticles.map(leaf => (
        <svg 
          key={leaf.id} 
          className="falling-leaf" 
          style={{ 
            left: `${leaf.left}%`, 
            animationDelay: `${leaf.delay}s`,
            transform: `rotate(${leaf.rotate}deg)`
          }}
          viewBox="0 0 24 24"
        >
          <path d="M12 2C12 2 4 10 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 10 12 2 12 2Z" fill="var(--accent-moss)" />
        </svg>
      ))}

      <header className="zen-header">
        <div className="brand-section">
          <span className="brand-logo">🌿</span>
          <div>
            <h1 className="brand-name">BlockBuddy</h1>
            <span className="brand-tagline">private blockchain bulletin board</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="mode-badge" onClick={toggleSimulationMode}>
            <span className={`connection-dot ${isSimulated ? '' : 'connected'}`} />
            <span>{isSimulated ? "Simulation Sandbox" : "Blockchain Connected"}</span>
          </div>

          <button className="btn-connect" onClick={connectWallet}>
            {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* Left column: input and list */}
        <div>
          <section className="zen-panel compose-panel">
            <h2 className="panel-title"><span>📝</span> Post on Blockchain</h2>
            <div className="compose-form">
              <div className="input-wrapper">
                <textarea 
                  className="forest-input"
                  placeholder={isSimulated ? "Write a message in this Zen Garden Sandbox..." : "Type message to record permanently on Ganache..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={280}
                  disabled={isLoading}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {message.length}/280 characters
                </span>
                <button className="btn-post" onClick={handlePost} disabled={isLoading || !message.trim()}>
                  {isLoading ? "Mining..." : "Plant Message 🌱"}
                </button>
              </div>
            </div>
          </section>

            {/* Smart Contract details in case users want to update address */}
            {!isSimulated && (
              <section className="zen-panel" style={{ marginBottom: '2rem', padding: '1rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contract Address:</span>
                  <input 
                    type="text" 
                    placeholder="Enter deployed contract address (0x...)"
                    value={currentAddress} 
                    onChange={handleAddressChange}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--accent-light)', 
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      width: '70%',
                      outline: 'none'
                    }} 
                  />
                </div>
              </section>
            )}

            <section className="zen-panel feed-panel">
              <h2 className="panel-title"><span>📜</span> Message Feed</h2>
              <div className="messages-list-container">
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🍂</div>
                    <p>No messages have been planted yet.</p>
                  </div>
                ) : (
                  posts.map((post, idx) => (
                    <div className="message-card" key={idx}>
                      <div className="card-header">
                        <span className="sender-address">
                          {post.sender.substring(0, 8)}...{post.sender.substring(post.sender.length - 6)}
                        </span>
                        <span className="post-time">
                          {new Date(post.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="message-content">{post.content}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right column: Interactive Visualizer */}
          <div>
            <section className="zen-panel interactive-visualizer">
              <h2 className="panel-title" style={{ alignSelf: 'flex-start' }}><span>🌳</span> BlockBuddy Tree</h2>
              
              <div className="tree-container">
                {renderTreeSVG()}
              </div>

              <div className="forest-stats">
                <p className="stats-title">Forest Message Count</p>
                <p className="stats-number">{posts.length}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {posts.length === 0 
                    ? "A single seed rests in the soil. Plant messages to grow it!"
                    : posts.length < 5 
                    ? "The seedling is growing healthy roots and tiny branches." 
                    : "The forest is beginning to canopy! Keep it growing."}
                </p>
              </div>
            </section>
          </div>
        </main>

        <footer>
          <p>
            BlockBuddy Blockchain Message Board • Powered by Hardhat, Ganache & React • <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={toggleSimulationMode}>Toggle Simulator</span>
          </p>
        </footer>
      </div>
    );
}

export default App;
