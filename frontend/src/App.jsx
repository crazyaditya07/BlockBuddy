import { useState, useEffect, useRef, useMemo } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Load the contract address from environment variables (e.g. VITE_CONTRACT_ADDRESS)
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";

const contractABI = [
  "function postMessage(string memory _content, int256 _parentIndex) public",
  "function getMessageCount() public view returns (uint256)",
  "function getMessage(uint256 index) public view returns (address, string memory, uint256, int256)",
  "function getMessages(uint256 start, uint256 count) public view returns ((address sender, string content, uint256 timestamp, int256 parentIndex)[])"
];

function App() {
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTreeShaking, setIsTreeShaking] = useState(false);
  
  // Legend collapsible state
  const [isLegendOpen, setIsLegendOpen] = useState(() => {
    const stored = localStorage.getItem("blockbuddy_legend_open");
    return stored === null ? true : stored === "true";
  });

  // Nature cluster & burst states
  const [isBursting, setIsBursting] = useState(false);
  const [isPulseMotion, setIsPulseMotion] = useState(false);
  const [burstParticles, setBurstParticles] = useState([]);

  // Custom states for replies
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Custom toast notification system
  const [toasts, setToasts] = useState([]);
  const showToast = (text, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [currentAddress, setCurrentAddress] = useState(() => {
    return localStorage.getItem("blockbuddy_contract_address") || contractAddress;
  });
  const [addressError, setAddressError] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  const [leavesParticles, setLeavesParticles] = useState([]);
  const containerRef = useRef(null);

  // Throttled mouse parallax listener
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isTouchDevice) return;

    let rafId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX = (e.clientX - centerX) / centerX;
      targetY = (e.clientY - centerY) / centerY;
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--parallax-x', currentX.toFixed(4));
        containerRef.current.style.setProperty('--parallax-y', currentY.toFixed(4));
      }
      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Initialize fireflies configuration
  const [fireflies, setFireflies] = useState(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 3,
      duration: Math.random() * 6 + 7,
      delay: Math.random() * -10
    }));
  });

  // Compute time-of-day ambient glow color property
  const glowColor = useMemo(() => {
    const hours = new Date().getHours();
    if (hours >= 20 || hours < 5) {
      return "rgba(62, 97, 107, 0.15)";
    } else {
      return "rgba(82, 141, 103, 0.12)";
    }
  }, []);

  // Generate deterministic color based on sender address
  const getSenderColor = (address) => {
    if (!address) return "var(--accent-light)";
    let hash = 0;
    const cleanAddr = address.toLowerCase();
    for (let i = 0; i < cleanAddr.length; i++) {
      hash = cleanAddr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 100) + 75;
    return `hsl(${hue}, 55%, 55%)`;
  };

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
          { index: 0, sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", content: "🌱 Welcome to BlockBuddy! Connect MetaMask or write local messages.", timestamp: Date.now() / 1000 - 3600, parentIndex: -1 },
          { index: 1, sender: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", content: "🌲 Let's plant some messages on the private blockchain to grow this forest!", timestamp: Date.now() / 1000 - 1800, parentIndex: -1 }
        ];
        setPosts(initialMock);
        localStorage.setItem("blockbuddy_posts", JSON.stringify(initialMock));
      }
      setIsSimulated(true);
    } else {
      checkConnection();
    }
  }, []);

  // Sync currentAddress with contractAddress if the environment variable changes (e.g. on redeploy)
  useEffect(() => {
    if (contractAddress && ethers.isAddress(contractAddress)) {
      setCurrentAddress(contractAddress);
      localStorage.setItem("blockbuddy_contract_address", contractAddress);
    }
  }, [contractAddress]);

  const handleTriggerBurst = () => {
    if (isBursting) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsPulseMotion(true);
      setTimeout(() => {
        setIsPulseMotion(false);
      }, 600);
      return;
    }

    setIsBursting(true);

    // Approximate cluster origin: bottom-right area of screen
    const particles = Array.from({ length: 25 }).map((_, i) => {
      const isCotton = i % 2 === 0;
      return {
        id: Date.now() + i,
        type: isCotton ? 'cotton' : 'firefly',
        originX: 'calc(100vw - 120px)',
        originY: 'calc(100vh - 120px)',
        targetX: `${Math.random() * 90 + 5}vw`,
        targetY: `${Math.random() * 90 + 5}vh`,
        targetScale: Math.random() * 1.5 + 0.5,
        duration: `${Math.random() * 1.0 + 1.2}s`,
        delay: `${Math.random() * 0.4}s`
      };
    });

    setBurstParticles(particles);

    setTimeout(() => {
      setBurstParticles([]);
      setIsBursting(false);
    }, 2600);
  };

  const handleClusterKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleTriggerBurst();
    }
  };

  const toggleLegend = () => {
    const nextVal = !isLegendOpen;
    setIsLegendOpen(nextVal);
    localStorage.setItem("blockbuddy_legend_open", String(nextVal));
  };

  const handleLegendKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleLegend();
    }
  };

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

  // MetaMask Event Listeners
  useEffect(() => {
    const handleAccounts = (accounts) => {
      setAccount(accounts[0] || null);
      if (accounts.length && !isSimulated) {
        fetchBlockchainMessages();
      }
    };
    const handleChain = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', handleChain);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccounts);
        window.ethereum.removeListener('chainChanged', handleChain);
      }
    };
  }, [isSimulated]);

  // Fetch messages from Blockchain using paginated batch loading
  const fetchBlockchainMessages = async () => {
    if (!window.ethereum || !currentAddress || !ethers.isAddress(currentAddress)) return;
    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const code = await provider.getCode(currentAddress);
      if (code === "0x" || code === "0x0") {
        console.warn(`No contract code at address ${currentAddress} on the active network.`);
        showToast("Contract not found on the active network. Please verify MetaMask network settings.", "error");
        setIsLoading(false);
        return;
      }

      const contract = new ethers.Contract(currentAddress, contractABI, provider);
      const countBig = await contract.getMessageCount();
      const count = Number(countBig);
      
      const loadedPosts = [];
      const batchSize = 50;
      
      for (let start = 0; start < count; start += batchSize) {
        const batch = await contract.getMessages(start, batchSize);
        batch.forEach((item, idx) => {
          loadedPosts.push({
            index: start + idx,
            sender: item.sender,
            content: item.content,
            timestamp: Number(item.timestamp),
            parentIndex: Number(item.parentIndex)
          });
        });
      }
      
      setPosts(loadedPosts);
    } catch (error) {
      console.error("Failed to fetch blockchain messages:", error);
      showToast("Failed to fetch messages. Please check contract deployment.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Connect MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsSimulated(false);
        localStorage.setItem("blockbuddy_sim", "false");
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        fetchBlockchainMessages();
      } catch (error) {
        console.error("Wallet connection failed:", error);
        showToast("Wallet connection failed.", "error");
      }
    } else {
      showToast("MetaMask not detected. Simulation sandbox enabled.", "info");
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
      showToast("Switched to offline simulation sandbox.", "info");
    } else {
      setAccount(null);
      setPosts([]);
      connectWallet();
    }
  };

  const handleAddressChange = (e) => {
    const addr = e.target.value.trim();
    setCurrentAddress(addr);
    if (addr === "" || ethers.isAddress(addr)) {
      setAddressError("");
      localStorage.setItem("blockbuddy_contract_address", addr);
    } else {
      setAddressError("Not a valid Ethereum address");
    }
  };

  // User posts a message or reply
  const handlePost = async (content, parentIdx = -1) => {
    if (!content.trim()) return;

    if (content.length > 280) {
      showToast("Message exceeds the 280-character limit.", "error");
      return;
    }

    triggerLeafFall();

    if (isSimulated) {
      const newIdx = posts.length;
      const newPost = {
        index: newIdx,
        sender: account || "0xSimulatedUserAccount",
        content: content,
        timestamp: Date.now() / 1000,
        parentIndex: parentIdx
      };
      const updated = [...posts, newPost];
      setPosts(updated);
      localStorage.setItem("blockbuddy_posts", JSON.stringify(updated));
      
      if (parentIdx === -1) {
        setMessage("");
      } else {
        setReplyContent("");
        setReplyingTo(null);
      }
      showToast("🌱 Message planted in simulator sandbox!", "success");
      return;
    }

    if (!account) {
      showToast("Please connect your wallet first.", "error");
      return;
    }

    if (!currentAddress || !ethers.isAddress(currentAddress)) {
      showToast("Please enter a valid contract address.", "error");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(currentAddress, contractABI, signer);

    try {
      setIsLoading(true);
      const tx = await contract.postMessage(content, parentIdx);
      await tx.wait();
      
      if (parentIdx === -1) {
        setMessage("");
      } else {
        setReplyContent("");
        setReplyingTo(null);
      }
      showToast("🌱 Message planted on-chain!", "success");
      fetchBlockchainMessages();
    } catch (error) {
      console.error(error);
      showToast("Failed to post message. Check contract and gas.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Click handler to shake the tree visualizer
  const handleTreeShake = () => {
    if (isTreeShaking) return;
    setIsTreeShaking(true);
    triggerLeafFall();
    setTimeout(() => {
      setIsTreeShaking(false);
    }, 600);
  };

  // Keyboard helper for shaking the tree
  const handleTreeKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleTreeShake();
    }
  };

  // Visual leaf particles effect
  const triggerLeafFall = () => {
    const leaves = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10,
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
    const treeStages = {
      trunkHeight: Math.min(100 + count * 5, 160),
      branchCount: Math.min(Math.floor(count / 2), 6),
      leafCount: Math.min(count * 3, 40)
    };

    const leaves = [];
    for (let i = 0; i < treeStages.leafCount; i++) {
      const angle = (i * 137.5) * (Math.PI / 180);
      const radius = Math.min(20 + i * 2, 70);
      const cx = 160 + Math.cos(angle) * radius;
      const cy = (280 - treeStages.trunkHeight) + Math.sin(angle) * (radius * 0.6) - 15;
      leaves.push({ cx, cy, id: i });
    }

    return (
      <svg 
        className={`tree-svg ${isTreeShaking ? 'shaking' : ''}`} 
        viewBox="0 0 320 280" 
        role="button" 
        aria-label="Shake the tree to drop leaves" 
        tabIndex={0}
        onClick={handleTreeShake}
        onKeyDown={handleTreeKeyDown}
      >
        <defs>
          <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a2a1e" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soil strip instead of dashed line */}
        <rect x="20" y="270" width="280" height="8" rx="4" fill="url(#soilGrad)" />
        
        {/* Soil decorations */}
        <ellipse cx="60" cy="270" rx="5" ry="2.5" fill="#4a3e3d" />
        <ellipse cx="250" cy="270" rx="7" ry="3" fill="#3c3433" />
        <path d="M 95 270 Q 93 262 88 260 M 95 270 Q 97 263 102 261 M 95 270 Q 95 261 95 257" stroke="var(--accent-moss)" strokeWidth="1" fill="none" />
        
        {/* Tiny mushroom detail */}
        <path d="M 200 270 Q 200 264 200 264" stroke="#8c7a6b" strokeWidth="2" strokeLinecap="round" />
        <path d="M 197 264 Q 200 260 203 264 Z" fill="#b91c1c" />

        {count > 0 && (
          <path d="M 160 270 Q 145 278 120 278 M 160 270 Q 175 278 200 278" stroke="var(--text-muted)" strokeWidth="2" fill="none" opacity="0.6" />
        )}
        
        <line 
          x1="160" 
          y1="270" 
          x2="160" 
          y2={280 - treeStages.trunkHeight} 
          className="trunk" 
          strokeWidth={Math.min(4 + count * 0.5, 12)}
        />
        
        {treeStages.branchCount > 0 && (
          <>
            <path key={`b1-${count}`} d={`M 160 ${240 - treeStages.trunkHeight/3} Q 130 ${200 - treeStages.trunkHeight/2} 110 ${180 - treeStages.trunkHeight/2}`} className="branch sprout-item" strokeWidth="3" fill="none" />
            <path key={`b2-${count}`} d={`M 160 ${220 - treeStages.trunkHeight/2} Q 190 ${180 - treeStages.trunkHeight/2} 210 ${160 - treeStages.trunkHeight/2}`} className="branch sprout-item" strokeWidth="2.5" fill="none" />
          </>
        )}
        {treeStages.branchCount > 3 && (
          <>
            <path key={`b3-${count}`} d={`M 160 ${200 - treeStages.trunkHeight/1.5} Q 140 ${160 - treeStages.trunkHeight/1.5} 125 ${140 - treeStages.trunkHeight/1.5}`} className="branch sprout-item" strokeWidth="2" fill="none" />
            <path key={`b4-${count}`} d={`M 160 ${190 - treeStages.trunkHeight/1.5} Q 180 ${150 - treeStages.trunkHeight/1.5} 195 ${130 - treeStages.trunkHeight/1.5}`} className="branch sprout-item" strokeWidth="2" fill="none" />
          </>
        )}

        {leaves.map((l) => (
          <path 
            key={`leaf-${l.id}`}
            d={`M ${l.cx} ${l.cy} C ${l.cx - 8} ${l.cy - 12}, ${l.cx + 8} ${l.cy - 12}, ${l.cx} ${l.cy}`}
            className="leaf sprout-item" 
            title={`Leaf #${l.id + 1}`}
          />
        ))}

        {/* Orbiting firefly for canopy life */}
        <circle cx="160" cy="140" r="3" className="tree-orbiting-firefly" />

        {count === 0 && (
          <g>
            <circle cx="160" cy="265" r="4" fill="var(--accent-light)" />
            <path d="M 160 265 Q 163 258 168 258" stroke="var(--accent-light)" strokeWidth="1.5" fill="none" />
          </g>
        )}
      </svg>
    );
  };

  // Group threads: filter parents and map replies
  const groupedThreads = useMemo(() => {
    const parents = posts.filter(p => Number(p.parentIndex) === -1);
    // Sort top-level posts newest first
    parents.sort((a, b) => b.timestamp - a.timestamp);

    const repliesMap = {};
    posts.forEach(p => {
      const parent = Number(p.parentIndex);
      if (parent !== -1) {
        if (!repliesMap[parent]) repliesMap[parent] = [];
        repliesMap[parent].push(p);
      }
    });

    // Sort replies oldest first (chronological order)
    Object.keys(repliesMap).forEach(key => {
      repliesMap[key].sort((a, b) => a.timestamp - b.timestamp);
    });

    return { parents, repliesMap };
  }, [posts]);

  return (
    <div className="app-wrapper" ref={containerRef} style={{ '--glow-color': glowColor }}>
      <div className="ambient-glow parallax-far" />

      {/* Background corner decorations */}
      <svg className="bg-leaf-decorations bg-leaf-top-left parallax-far" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 0 C20 30 20 70 50 100 C80 70 80 30 50 0 Z" />
      </svg>
      <svg className="bg-leaf-decorations bg-leaf-bottom-right parallax-far" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 0 C20 30 20 70 50 100 C80 70 80 30 50 0 Z" />
      </svg>

      {/* Ambient background fireflies */}
      <div className="firefly-container parallax-mid" aria-hidden="true">
        {fireflies.map((fly) => (
          <div 
            key={fly.id} 
            className="firefly" 
            style={{
              left: `${fly.left}%`,
              top: `${fly.top}%`,
              width: `${fly.size}px`,
              height: `${fly.size}px`,
              animationDuration: `${fly.duration}s`,
              animationDelay: `${fly.delay}s`
            }}
          />
        ))}
      </div>

      {/* Toast banner Notifications */}
      <div className="toasts-container" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === "success" ? "🌱" : t.type === "error" ? "⚠️" : "ℹ️"}</span>
            <div>{t.text}</div>
          </div>
        ))}
      </div>

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
          aria-hidden="true"
        >
          <path d="M12 2C12 2 4 10 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 10 12 2 12 2Z" fill="var(--accent-moss)" />
        </svg>
      ))}

      <header className="zen-header">
        <div className="brand-section">
          <span className="brand-logo" role="img" aria-label="sprout">🌿</span>
          <div>
            <h1 className="brand-name">BlockBuddy</h1>
            <span className="brand-tagline">decentralized bulletin board</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="mode-selector-container">
            <button 
              className={`btn-mode-select ${!isSimulated ? 'active' : ''}`}
              onClick={() => {
                if (isSimulated) toggleSimulationMode();
              }}
              aria-label="Switch to Live Blockchain Mode"
              title="Switch to Live Blockchain Mode"
            >
              <span className="connection-dot connected" />
              <span>Blockchain</span>
            </button>
            <button 
              className={`btn-mode-select ${isSimulated ? 'active' : ''}`}
              onClick={() => {
                if (!isSimulated) toggleSimulationMode();
              }}
              aria-label="Switch to Simulation Sandbox Mode"
              title="Switch to Simulation Sandbox Mode"
            >
              <span className="connection-dot" />
              <span>Sandbox</span>
            </button>
          </div>

          <button className="btn-connect" onClick={connectWallet} aria-label={account ? `Wallet connected address ${account}` : "Connect Wallet"}>
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
                <label htmlFor="message-input" className="sr-only">Message content</label>
                <textarea 
                  id="message-input"
                  className="forest-input"
                  placeholder={isSimulated ? "Write a message in this Zen Garden Sandbox..." : "Type message to record permanently on blockchain..."}
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
                <button className="btn-post" onClick={() => handlePost(message, -1)} disabled={isLoading || !message.trim()}>
                  <span>{isLoading ? "Mining..." : "Plant Message 🌱"}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Smart Contract address field */}
          {!isSimulated && (
            <section className="zen-panel" style={{ marginBottom: '2rem', padding: '1rem 2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="contract-address-input" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contract Address:</label>
                  <input 
                    id="contract-address-input"
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
                {addressError && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'right' }}>{addressError}</span>
                )}
              </div>
            </section>
          )}

          <section className="zen-panel feed-panel">
            <h2 className="panel-title"><span>📜</span> Message Feed</h2>
            <div className="messages-list-container">
              {groupedThreads.parents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🍂</div>
                  <p>No messages have been planted yet.</p>
                </div>
              ) : (
                <>
                  {groupedThreads.parents.slice(0, visibleCount).map((post) => {
                    const isOwn = post.sender.toLowerCase() === account?.toLowerCase();
                    const senderColor = getSenderColor(post.sender);
                    const replies = groupedThreads.repliesMap[post.index] || [];
                    const isReplying = replyingTo === post.index;

                    return (
                      <div key={post.index} style={{ marginBottom: '1.5rem' }}>
                        {/* Parent message card */}
                        <div 
                          className={`message-card ${isOwn ? 'own-message' : ''}`} 
                          style={{ borderLeft: `4px solid ${senderColor}` }}
                        >
                          <div className="card-header">
                            <span className="sender-address" style={{ color: senderColor }}>
                              <svg style={{ width: '8px', height: '8px', fill: senderColor, marginRight: '4px', verticalAlign: 'middle' }} viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 2C12 2 4 10 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 10 12 2 12 2Z" />
                              </svg>
                              {post.sender.substring(0, 8)}...{post.sender.substring(post.sender.length - 6)}
                            </span>
                            <span className="post-time">
                              {new Date(post.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="message-content">{post.content}</div>
                          
                          <button 
                            className="btn-reply" 
                            onClick={() => setReplyingTo(isReplying ? null : post.index)}
                            aria-label="Reply to this message"
                          >
                            💬 Reply
                          </button>
                        </div>

                        {/* Inline reply form */}
                        {isReplying && (
                          <div className="reply-form">
                            <textarea 
                              className="reply-input"
                              placeholder="Write your reply (max 280 chars)..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              maxLength={280}
                              disabled={isLoading}
                            />
                            <div className="reply-actions">
                              <button 
                                className="btn-reply-submit" 
                                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                                onClick={() => setReplyingTo(null)}
                                disabled={isLoading}
                              >
                                Cancel
                              </button>
                              <button 
                                className="btn-reply-submit" 
                                onClick={() => handlePost(replyContent, post.index)}
                                disabled={isLoading || !replyContent.trim()}
                              >
                                {isLoading ? "Sending..." : "Send Reply"}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Nested replies list */}
                        {replies.length > 0 && (
                          <div className="replies-container">
                            {replies.map((reply) => {
                              const isReplyOwn = reply.sender.toLowerCase() === account?.toLowerCase();
                              const replyColor = getSenderColor(reply.sender);
                              return (
                                <div 
                                  key={reply.index} 
                                  className={`message-card reply-card ${isReplyOwn ? 'own-message' : ''}`}
                                  style={{ borderLeft: `3px solid ${replyColor}` }}
                                >
                                  <div className="card-header">
                                    <span className="sender-address" style={{ color: replyColor, fontSize: '0.7rem' }}>
                                      <svg style={{ width: '6px', height: '6px', fill: replyColor, marginRight: '3px', verticalAlign: 'middle' }} viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 2C12 2 4 10 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 10 12 2 12 2Z" />
                                      </svg>
                                      {reply.sender.substring(0, 8)}...{reply.sender.substring(reply.sender.length - 6)}
                                    </span>
                                    <span className="post-time" style={{ fontSize: '0.7rem' }}>
                                      {new Date(reply.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div className="message-content">{reply.content}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {groupedThreads.parents.length > visibleCount && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      <button 
                        className="btn-connect" 
                        onClick={() => setVisibleCount(prev => prev + 20)}
                        style={{ margin: '0 auto' }}
                      >
                        Load more
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right column: Interactive Visualizer */}
        <div>
          <section className="zen-panel interactive-visualizer">
            <h2 className="panel-title" style={{ alignSelf: 'flex-start' }}><span>🌳</span> BlockBuddy Tree</h2>
            
            <div className="tree-container" style={{ position: 'relative' }}>
              {renderTreeSVG()}
              
              {/* Cotton & Firefly Nature Cluster */}
              <div 
                className={`nature-cluster ${isPulseMotion ? 'pulse-motion' : ''}`}
                role="button"
                tabIndex={0}
                onClick={handleTriggerBurst}
                onKeyDown={handleClusterKeyDown}
                aria-label="Release the pollen and fireflies burst"
                title="Release the pollen and fireflies burst"
              >
                {/* Only render idle particles when NOT bursting */}
                {!isBursting && (
                  <>
                    {/* 5 Cotton puffs */}
                    <div className="cotton-puff" style={{ width: '12px', height: '12px', top: '25%', left: '30%', '--drift-x': '4px', '--drift-y': '-6px', animationDelay: '0s' }} />
                    <div className="cotton-puff" style={{ width: '10px', height: '10px', top: '40%', left: '50%', '--drift-x': '-5px', '--drift-y': '5px', animationDelay: '-1s' }} />
                    <div className="cotton-puff" style={{ width: '14px', height: '14px', top: '55%', left: '25%', '--drift-x': '6px', '--drift-y': '-4px', animationDelay: '-2s' }} />
                    <div className="cotton-puff" style={{ width: '9px', height: '9px', top: '20%', left: '60%', '--drift-x': '-3px', '--drift-y': '-7px', animationDelay: '-3s' }} />
                    <div className="cotton-puff" style={{ width: '11px', height: '11px', top: '65%', left: '45%', '--drift-x': '5px', '--drift-y': '6px', animationDelay: '-1.5s' }} />

                    {/* 3 Cluster fireflies */}
                    <div className="nature-firefly" style={{ width: '4px', height: '4px', top: '35%', left: '40%', '--drift-x': '-6px', '--drift-y': '8px', animationDelay: '0s' }} />
                    <div className="nature-firefly" style={{ width: '5px', height: '5px', top: '50%', left: '35%', '--drift-x': '7px', '--drift-y': '-5px', animationDelay: '-0.7s' }} />
                    <div className="nature-firefly" style={{ width: '4px', height: '4px', top: '30%', left: '55%', '--drift-x': '-5px', '--drift-y': '-6px', animationDelay: '-1.4s' }} />
                  </>
                )}
              </div>
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

            {/* Collapsible Meet the Forest Legend Card */}
            <div className="legend-card">
              <div 
                className="legend-header"
                role="button"
                tabIndex={0}
                onClick={toggleLegend}
                onKeyDown={handleLegendKeyDown}
                aria-expanded={isLegendOpen}
                aria-label="Toggle Forest Legend Guide"
              >
                <span>🌲 Meet the Forest</span>
                <span className={`legend-toggle-btn ${isLegendOpen ? '' : 'collapsed'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
              <div className={`legend-content ${isLegendOpen ? '' : 'collapsed'}`} aria-hidden={!isLegendOpen}>
                <div className="legend-row">
                  <span className="legend-icon" role="img" aria-label="tree">🌳</span>
                  <span>The tree grows leaves and branches for every message.</span>
                </div>
                <div className="legend-row">
                  <span className="legend-icon" role="img" aria-label="sparkles">✨</span>
                  <span>Fireflies drift around to provide calming ambient light.</span>
                </div>
                <div className="legend-row">
                  <span className="legend-icon" role="img" aria-label="leaf">🍃</span>
                  <span>Click the tree trunk to give it a gentle shake.</span>
                </div>
                <div className="legend-row">
                  <span className="legend-icon" role="img" aria-label="palette">🎨</span>
                  <span>Consistent author hues match wallet addresses.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer>
        <p>
          BlockBuddy Blockchain Message Board • Powered by Hardhat, React • <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={toggleSimulationMode}>Toggle Simulator</span>
        </p>
      </footer>

      {/* Full-Screen Burst Particles Overlay */}
      {burstParticles.length > 0 && (
        <div className="burst-overlay">
          {burstParticles.map(p => (
            <div 
              key={p.id}
              className={`burst-particle ${p.type}`}
              style={{
                width: p.type === 'cotton' ? `${Math.random() * 8 + 8}px` : `${Math.random() * 2 + 4}px`,
                height: p.type === 'cotton' ? `${Math.random() * 8 + 8}px` : `${Math.random() * 2 + 4}px`,
                '--origin-x': p.originX,
                '--origin-y': p.originY,
                '--target-x': p.targetX,
                '--target-y': p.targetY,
                '--target-scale': p.targetScale,
                '--burst-duration': p.duration,
                animationDelay: p.delay
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
