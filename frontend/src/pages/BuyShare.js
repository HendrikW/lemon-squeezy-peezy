import React, {useContext, useEffect, useState} from 'react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import axios from 'axios';
import {Link, useHistory} from 'react-router-dom';
import LemonDivider from '../components/main/LemonDivider';
import ExitIcon from '../assets/exit-icon.png';
const backendURL = process.env.REACT_APP_BACKENDURL;

const BuyShare = () => {
  const {buy, currentUser} = useContext(AuthContext);
  const [shares, setShares] = useState();
  const [currentShare, setCurrentShare] = useState();
  const [currentStep, setCurrentStep] = useState(1);
  const [amountOfShares, setAmountOfShares] = useState();
  const [error, setError] = useState();
  const history = useHistory();

  useEffect(() => {
    if (buy) {
      axios.get(`${backendURL}/api/shares/${buy._id}`).then((data) => {
        setShares(data.data.shares);
      });
    }
  }, [buy]);

  const handleBuyStart = (share) => {
    setCurrentShare(share);
    setCurrentStep(2);
  };

  const handleExitClick = () => {
    setCurrentStep(1);
  };

  const handleBuySubmit = (e) => {
    e.preventDefault();

    axios
      .post(`${backendURL}/api/buyshare`, {
        name: currentShare.name,
        company: currentShare.company,
        price: currentShare.price * amountOfShares,
        user: currentUser.data.email,
        boughtAmount: amountOfShares,
        restAmount: currentShare.amount - amountOfShares,
        originalShare: currentShare._id,
      })
      .then(() => {
        console.log('success');
        history.push('/success');
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
  };

  return (
    <Layout>
      <div className="flex flex-col justfiy-center items-center">
        {currentStep === 1 && (
          <>
            <h1 className="text-center">
              Buy your share from {buy ? buy.name : 'your favorite company'}{' '}
              here:
            </h1>

            {!shares && (
              <div className="flex flex-col items-center">
                <h3 className="mb-6">Please choose a company.</h3>
                <Link className="smallButton" to="/companies">
                  See companies
                </Link>
              </div>
            )}
            {shares &&
              shares.map((share) => {
                return (
                  <div
                    key={share._id}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="border rounded-xl shadow my-2 mx-8 px-2 py-4 w-48 text-center">
                      <h2>{share.name}</h2>
                      <div>Price: {share.price}</div>
                      <div>Available amount: {share.amount}</div>
                      <button
                        type="button"
                        className="smallButton my-4"
                        onClick={() => {
                          setCurrentStep(2);
                          handleBuyStart(share);
                        }}
                      >
                        Buy Share
                      </button>
                    </div>
                    {share !== shares[shares.length - 1] && <LemonDivider />}
                  </div>
                );
              })}
          </>
        )}
        {currentStep === 2 && (
          <>
            <button type="button" className="mx-auto" onClick={handleExitClick}>
              <img src={ExitIcon} alt="Exit-Icon" className="w-4" />
            </button>
            <h1 className="text-center">You are buying {currentShare.name}</h1>
            <LemonDivider />
            <form onSubmit={handleBuySubmit}>
              <label>How many share would you like to buy?</label>
              <input
                type="number"
                onChange={(e) => {
                  if (e.target.value > currentShare.amount) {
                    setError(true);
                  } else if (e.target.value < currentShare.amount) {
                    setError(false);
                    setAmountOfShares(e.target.value);
                  }
                }}
              />
              <button type="submit" className="smallButton my-4">
                Buy Now
              </button>
            </form>
          </>
        )}
        {error && (
          <>
            <div>
              There are only {currentShare.amount} Shares available. Please
              choose a lower number!
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default BuyShare;
