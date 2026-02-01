import React, { useState, useEffect } from 'react';
import { Upload, Download, FileArchive, User, Loader2, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';

const IPFSDashboard = () => {
  const [userAddress, setUserAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState('');
  const [userCIDs, setUserCIDs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [adminAccount, setAdminAccount] = useState(null);
  const [registrationName, setRegistrationName] = useState('');
  const [addressInput, setAddressInput] = useState('');

  const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
  const IPFS_API_URL = 'http://127.0.0.1:5001/api/v0';

  
  const ADMIN_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

  const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "userAddress", "type": "address"},
        {"indexed": false, "internalType": "string", "name": "cid", "type": "string"}
      ],
      "name": "CIDAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true, "internalType": "address", "name": "userAddress", "type": "address"},
        {"indexed": false, "internalType": "string", "name": "name", "type": "string"}
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "_userAddress", "type": "address"},
        {"internalType": "string", "name": "_cid", "type": "string"}
      ],
      "name": "addCIDForUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_newAdmin", "type": "address"}],
      "name": "changeAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUser",
      "outputs": [
        {"internalType": "string", "name": "", "type": "string"},
        {"internalType": "string[]", "name": "", "type": "string[]"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "getUserCIDs",
      "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
      "name": "isRegistered",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "address", "name": "_userAddress", "type": "address"},
        {"internalType": "string", "name": "_name", "type": "string"}
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  useEffect(() => {
    loadContract();
  }, []);

  const loadContract = async () => {
    try {
      const Web3 = (await import('https://cdn.jsdelivr.net/npm/web3@1.8.0/+esm')).default;
      const web3Instance = new Web3('http://127.0.0.1:8545');
      setWeb3(web3Instance);
      
      const admin = web3Instance.eth.accounts.privateKeyToAccount(ADMIN_PRIVATE_KEY);
      web3Instance.eth.accounts.wallet.add(admin);
      setAdminAccount(admin.address);
      
      const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setContract(contractInstance);
      
      console.log('Contract loaded successfully at:', CONTRACT_ADDRESS);
      console.log('Admin account:', admin.address);
      
      const balance = await web3Instance.eth.getBalance(admin.address);
      const balanceEth = web3Instance.utils.fromWei(balance, 'ether');
      console.log('Admin balance:', balanceEth, 'ETH');
      
      if (parseFloat(balanceEth) < 0.01) {
        showNotification('error', `Admin wallet has insufficient funds: ${balanceEth} ETH`);
      }
    } catch (error) {
      console.error('Contract load error:', error);
      showNotification('error', 'Failed to load contract: ' + error.message);
    }
  };

  const validateAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleCheckAddress = async () => {
    if (!addressInput.trim()) {
      showNotification('error', 'Please enter an address');
      return;
    }

    if (!validateAddress(addressInput)) {
      showNotification('error', 'Invalid Ethereum address format');
      return;
    }

    setUserAddress(addressInput);
    await checkRegistration(addressInput);
    showNotification('success', 'Address loaded successfully!');
  };

  const checkRegistration = async (address) => {
  if (!contract) {
    console.log('Contract not loaded yet');
    return;
  }
  
  try {
    const registered = await contract.methods.isRegistered(address).call();
    setIsRegistered(registered);
    
    if (registered) {
      const userData = await contract.methods.getUser(address).call();
      // Web3.js returns tuple as an object with numeric indices
      const name = userData[0];  // First return value
      const cids = userData[1];  // Second return value
      
      setUserName(name);
      setUserCIDs(cids);
      console.log('User data loaded:', { address, name, cids });
    }
  } catch (error) {
    console.error('Error checking registration:', error);
    showNotification('error', 'Error checking registration: ' + error.message);
  }
};

  const registerUser = async () => {
    if (!registrationName.trim()) {
      showNotification('error', 'Please enter your name');
      return;
    }

    if (!web3 || !contract || !adminAccount) {
      showNotification('error', 'Contract not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    try {
      console.log('Registering user with admin account...');
      
      const balance = await web3.eth.getBalance(adminAccount);
      const balanceEth = web3.utils.fromWei(balance, 'ether');
      console.log('Admin balance before transaction:', balanceEth, 'ETH');
      
      if (parseFloat(balanceEth) < 0.001) {
        showNotification('error', 'Admin wallet has insufficient ETH. Please restart Hardhat node.');
        setLoading(false);
        return;
      }
      
      const data = contract.methods.registerUser(userAddress, registrationName).encodeABI();
      
      const gasEstimate = await web3.eth.estimateGas({
        from: adminAccount,
        to: CONTRACT_ADDRESS,
        data: data
      });
      
      const gasPrice = await web3.eth.getGasPrice();
      const nonce = await web3.eth.getTransactionCount(adminAccount, 'pending');
      
      const tx = {
        from: adminAccount,
        to: CONTRACT_ADDRESS,
        gas: gasEstimate,
        gasPrice: gasPrice,
        data: data,
        nonce: nonce
      };
      
      console.log('Transaction details:', { gasEstimate, gasPrice, nonce });
      
      const signedTx = await web3.eth.accounts.signTransaction(tx, ADMIN_PRIVATE_KEY);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      const gasCostWei = BigInt(receipt.gasUsed) * BigInt(gasPrice);
      const gasCostEth = web3.utils.fromWei(gasCostWei.toString(), 'ether');
      
      console.log('Registration transaction:', receipt);
      console.log(`Gas used: ${receipt.gasUsed}, Gas price: ${gasPrice}`);
      console.log(`Total gas cost: ${gasCostEth} ETH paid by admin`);
      
      showNotification('success', `Registration successful! Gas cost: ${parseFloat(gasCostEth).toFixed(6)} ETH paid by admin.`);
      await checkRegistration(userAddress);
      setRegistrationName('');
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMsg = 'Registration failed';
      if (error.message.includes('insufficient funds')) {
        errorMsg = 'Insufficient funds. Please restart Hardhat node and redeploy contract.';
      } else if (error.message.includes('missing trie node')) {
        errorMsg = 'Blockchain state error. Please restart Hardhat node.';
      } else if (error.message.includes('nonce')) {
        errorMsg = 'Nonce error. Please try again.';
      } else {
        errorMsg = 'Registration failed: ' + (error.message || 'Unknown error');
      }
      
      showNotification('error', errorMsg);
    }
    setLoading(false);
  };

  const uploadToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${IPFS_API_URL}/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('IPFS upload failed');
    }

    const data = await response.json();
    return data.Hash;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      showNotification('error', 'Please upload a ZIP file');
      return;
    }

    setUploadProgress(true);
    try {
      const cid = await uploadToIPFS(file);
      console.log('File uploaded to IPFS with CID:', cid);
      
      const data = contract.methods.addCIDForUser(userAddress, cid).encodeABI();
      
      const gasEstimate = await web3.eth.estimateGas({
        from: adminAccount,
        to: CONTRACT_ADDRESS,
        data: data
      });
      
      const gasPrice = await web3.eth.getGasPrice();
      const nonce = await web3.eth.getTransactionCount(adminAccount, 'pending');
      
      const tx = {
        from: adminAccount,
        to: CONTRACT_ADDRESS,
        gas: gasEstimate,
        gasPrice: gasPrice,
        data: data,
        nonce: nonce
      };
      
      const signedTx = await web3.eth.accounts.signTransaction(tx, ADMIN_PRIVATE_KEY);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      const gasCostWei = BigInt(receipt.gasUsed) * BigInt(gasPrice);
      const gasCostEth = web3.utils.fromWei(gasCostWei.toString(), 'ether');
      
      console.log('CID stored on blockchain:', receipt);
      console.log(`Total gas cost: ${gasCostEth} ETH paid by admin`);
      
      showNotification('success', `File uploaded! Gas cost: ${parseFloat(gasCostEth).toFixed(6)} ETH paid by admin.`);
      await checkRegistration(userAddress);
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', 'Upload failed: ' + (error.message || 'Unknown error'));
    }
    setUploadProgress(false);
    event.target.value = '';
  };

  const downloadFromIPFS = async (cid) => {
    try {
      const response = await fetch(`${IPFS_API_URL}/cat?arg=${cid}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('IPFS download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cid}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showNotification('success', 'Download started!');
    } catch (error) {
      console.error('Download error:', error);
      showNotification('error', 'Download failed: ' + (error.message || 'Unknown error'));
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm transform transition-all duration-500 ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {notification.message}
          </span>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent mb-3 tracking-tight">
            IPFS Storage Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Decentralized file storage on your terms</p>
          {adminAccount && (
            <p className="text-xs text-gray-400 mt-2">Gas fees paid by admin: {adminAccount.slice(0, 6)}...{adminAccount.slice(-4)}</p>
          )}
        </div>

        {!userAddress ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Your Address</h2>
              <p className="text-gray-600 mb-2">Enter your Ethereum wallet address to continue</p>
              <p className="text-sm text-blue-600 mb-8">No gas fees required - paid by admin</p>
              
              <input
                type="text"
                placeholder="0x..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all mb-4 font-mono text-sm"
              />
              
              <button
                onClick={handleCheckAddress}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300"
              >
                Continue
              </button>
            </div>
          </div>
        ) : !isRegistered ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Register Account</h2>
              <p className="text-gray-600 mb-2 text-center text-sm">Create your profile to start storing files</p>
              <p className="text-xs text-gray-500 font-mono mb-2 text-center">{userAddress.slice(0, 10)}...{userAddress.slice(-8)}</p>
              <p className="text-xs text-blue-600 mb-6 text-center">Gas fees paid automatically by admin</p>
              <input
                type="text"
                placeholder="Enter your name"
                value={registrationName}
                onChange={(e) => setRegistrationName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all mb-4"
              />
              <button
                onClick={registerUser}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register (Free - No Gas)'
                )}
              </button>
              <button
                onClick={() => setUserAddress('')}
                className="w-full mt-3 text-gray-600 py-2 text-sm hover:text-gray-800"
              >
                Change Address
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{userName}</h2>
                  <p className="text-sm text-gray-500 font-mono">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</p>
                </div>
                <div className="ml-auto bg-blue-50 px-6 py-3 rounded-xl">
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-3xl font-bold text-blue-600">{userCIDs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800">Upload Files</h3>
                  <p className="text-xs text-blue-600">Gas fees paid automatically</p>
                </div>
              </div>
              
              <label className="block">
                <div className="border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group">
                  <FileArchive className="w-16 h-16 mx-auto text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {uploadProgress ? 'Uploading...' : 'Click to upload ZIP file'}
                  </p>
                  <p className="text-sm text-gray-500">Files will be stored on IPFS</p>
                  {uploadProgress && (
                    <Loader2 className="w-8 h-8 mx-auto mt-4 animate-spin text-blue-600" />
                  )}
                </div>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  disabled={uploadProgress}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileArchive className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Your Files</h3>
              </div>

              {userCIDs.length === 0 ? (
                <div className="text-center py-12">
                  <FileArchive className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userCIDs.map((cid, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                          <FileArchive className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 mb-1">File #{index + 1}</p>
                          <p className="font-mono text-sm text-gray-700 truncate">{cid}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFromIPFS(cid)}
                        className="ml-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-lg hover:shadow-xl hover:scale-110 transform transition-all duration-300 flex-shrink-0"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => { setUserAddress(''); setIsRegistered(false); setAddressInput(''); }}
              className="w-full text-center text-gray-600 py-3 text-sm hover:text-gray-800"
            >
              Switch Address
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default IPFSDashboard;