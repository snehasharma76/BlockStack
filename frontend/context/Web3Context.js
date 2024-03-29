import { createContext, useEffect, useState } from "react";
import Web3 from "web3";
import CryptoStackMain from "../public/CryptoStackMain.json";
import CryptoStackRewardNFT from "../public/CryptoStackRewardNFT.json";


export const Web3Context = createContext({
  web3: null,
  setWeb3: () => {},
  address: null,
  setAddress: () => {},
  logout: () => {},
  isFrequentContributor: async (account) => {},
  getAllQuestions: async () => {},
  getAnswersForQuestion: async (questionId) => {},
  getMyNFTS: async (account) => {},
  mintMyNFTS: async (account) => {},
  getTokenURI: async (tokenId) => {},
  registerNewUser: async (username, account) => {},
  createNewQuestion: async (question, account) => {},
  answerQuestion: async (questionId, answer, account) => {},
  acceptAnswer: async (answerId, account) => {},
  upvoteQuestion: async (questionId) => {},
  downvoteQuestion: async (questionId) => {},
  upvoteAnswer: async (answerId) => {},
  downvoteAnswer: async (answerId) => {},
  purchaseNFT: async (tokenURI, account) => {},
  getUserInfo: async () => {},
  getUsername: async (account) => {},
  CryptoStack: null,
  CryptoStackNFT: null,
  loading: false,
  tryConnectWallet: () => {},
  questions: [],
  setQuestions: () => {},
  userData: null,
  setUserData: () => {},
  disconnectWallet: () => {},
});

const Web3Provider = ({ children }) => {
  const [CryptoStack, setCryptoStack] = useState();
  const [CryptoStackNFT, setCryptoStackNFT] = useState();
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    (async () => {
      const web3Connected = await tryConnectWallet();
      setWeb3(web3Connected);
      loadBlockchainData(web3Connected);
    })();
  }, []);

  const logout = () => {
    setAddress(null);
  };

  const loadBlockchainData = async (web3) => {
    const networkId = await web3.eth.net.getId();
    const csMainAddress = process.env.NEXT_PUBLIC_MAIN_ADDRESS; // Add this line
    const csNFTAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS; // Add this line

    console.log(csMainAddress, csNFTAddress);
    if (csMainAddress && csNFTAddress) { // Modify this line
      setCryptoStack(
        new web3.eth.Contract(CryptoStackMain.abi, csMainAddress)
      );
      setCryptoStackNFT(
        new web3.eth.Contract(CryptoStackRewardNFT.abi, csNFTAddress)
      );
      return true;
    } else {
      window.alert(
        "Unidentified network, please connect to Celo or Alfajores Network"
      );
      return false;
    }
};

  const getUserInfo = async () => {
    const isRegistered = await CryptoStack.methods
      .isRegisteredUser(address)
      .call();
    if (isRegistered) {
      const uCount = await CryptoStack.methods.userCount().call();

      for (let i = 0; i < uCount; ++i) {
        const user = await CryptoStack.methods.users(i).call();
        if (user.userAddress.toLowerCase() === address.toLowerCase()) {
          return user;
        }
      }
    } else {
      return null;
    }
  };

  const getUsername = async (account) => {
    const isRegistered = await CryptoStack.methods
      .isRegisteredUser(address)
      .call();
    if (isRegistered) {
      const uCount = await CryptoStack.methods.userCount().call();

      for (let i = 0; i < uCount; ++i) {
        const user = await CryptoStack.methods.users(i).call();
        if (user.userAddress.toLowerCase() === account.toLowerCase()) {
          return user.userName;
        }
      }
    } else {
      return null;
    }
  };

  const isFrequentContributor = async () => {
    const isContributor = await CryptoStack.methods
      .isFrequentContributor(address)
      .call();
    return isContributor;
  };

  const getAllQuestions = async () => {
    let questions = [];
    const qCount = await CryptoStack.methods.questionCount().call();

    for (let i = 0; i < qCount; ++i) {
      const question = await CryptoStack.methods.questions(i).call();
      questions.push(question);
    }
    return questions;
  };

  const getAnswersForQuestion = async (questionId) => {
    let answers = [];
    const aCount = await CryptoStack.methods.answerCount().call();

    for (let i = 0; i < aCount; ++i) {
      const answer = await CryptoStack.methods.answers(i).call();
      if (answer.questionId == questionId) {
        answer["replierUsername"] = await getUsername(answer.replierAddress);
        answers.push(answer);
      }
    }
    return answers;
  };

  const getTokenURI = async (tokenId) => {
    const uri = await CryptoStackNFT.methods.tokenURI(tokenId).call();
    return uri;
  };

  const registerNewUser = async (username) => {
    setLoading(true);
    await CryptoStack.methods
      .registerNewUser(username)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        setLoading(false);
      })
      .on("error", (error, receipt) => {
        window.alert("Error occured:", error);
        setLoading(false);
      });
  };

  const createNewQuestion = async (question) => {
    setLoading(true);
    await CryptoStack.methods
      .createNewQuestion(question)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        setLoading(false);
      })
      .on("error", (error, receipt) => {
        setLoading(false);
        window.alert("Error occured:", error);
      });
  };

  const answerQuestion = async (questionId, answer) => {
    setLoading(true);
    await CryptoStack.methods
      .answerQuestion(questionId, answer)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        // confirmation
        setLoading(false);
      })
      .on("error", (error, receipt) => {
        window.alert("Error occured:", error);
        setLoading(false);
      });
  };

  const acceptAnswer = async (answerId) => {
    setLoading(true);
    await CryptoStack.methods
      .acceptAnswer(answerId)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        setLoading(false);
        // confirmation
      })
      .on("error", (error, receipt) => {
        window.alert("Error occured:", error);
        setLoading(false);
      });
  };

  const upvoteQuestion = async (questionId) => {
    setLoading(true);
    await CryptoStack.methods
      .upvoteQuestion(questionId)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        setLoading(false);
        // confirmation
      })
      .on("error", (error, receipt) => {
        window.alert("Error occured:", error);
        setLoading(false);
      });
  };

  const downvoteQuestion = async (questionId) => {
    setLoading(true);
    await CryptoStack.methods
      .downvoteQuestion(questionId)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        setLoading(false);
        // confirmation
      })
      .on("error", (error, receipt) => {
        window.alert("Error occured:", error);
        setLoading(false);
      });
  };

  const upvoteAnswer = async (answerId) => {
    setLoading(true);
    await CryptoStack.methods
      .upvoteAnswer(answerId)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        setLoading(false);
        // confirmation
      })
      .on("error", (error, receipt) => {
        window.alert("Error occured:", error);
        setLoading(false);
      });
  };

  const downvoteAnswer = async (answerId) => {
    setLoading(true);
    await CryptoStack.methods
      .downvoteAnswer(answerId)
      .send({ from: address })
      .on("transactionHash", function (hash) {})
      .on("receipt", function (receipt) {})
      .on("confirmation", (confirmationNumber, receipt) => {
        setLoading(false);
        // confirmation
      })
      .on("error", (error, receipt) => {
        window.alert("Error occured:", error);
        setLoading(false);
      });
  };
  

  const getMyNFTS = async () => {
    let nfts = [];
    const nftCount = await CryptoStackNFT.methods.returnNFTCount().call();
    for (let i = 0; i < nftCount; ++i) {
      const nft = await CryptoStackNFT.methods.nfts(i).call();
      if (nft.owner.toLowerCase() == address.toLowerCase()) {
        const uri = await getTokenURI(nft.tokenID);
        const resp = await fetch(uri);
        const metadata = await resp.json();
        metadata["tokenID"] = nft.tokenID;
        nfts.push(metadata);
      }
    }
    return nfts;
  };

  const mintMyNFTS = async () => {
   try{
    await CryptoStackMain.methods.mintNFT.call();
   } catch(error) {
    alert("Failed Mint")
  };
  };

  const tryConnectWallet = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const accounts = await window.web3.eth.getAccounts();
        setAddress(accounts?.[0]);
        return window.web3;
      } catch (error) {
        alert(error);
      }
    } else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      const accounts = await window.web3.eth.getAccounts();
      setAddress(accounts?.[0]);
      return window.web3;
    } else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setWeb3(null);
  };

  return (
    <Web3Context.Provider
      value={{
        web3,
        setWeb3,
        address,
        setAddress,
        logout,
        acceptAnswer,
        answerQuestion,
        createNewQuestion,
        getAllQuestions,
        getAnswersForQuestion,
        getMyNFTS,
        mintMyNFTS,
        getTokenURI,
        isFrequentContributor,
        registerNewUser,
        CryptoStack,
        CryptoStackNFT,
        getUserInfo,
        getUsername,
        loading,
        tryConnectWallet,
        questions,
        setQuestions,
        userData,
        setUserData,
        disconnectWallet,
        upvoteQuestion,
        downvoteQuestion,
        upvoteAnswer,
        downvoteAnswer,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
