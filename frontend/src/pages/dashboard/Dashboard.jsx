import { useEffect, useState } from 'react';
import BorrowIcon from '@/assets/icons/borrow_dynamic.svg?react';
import CollateralIcon from '@/assets/icons/collateral_dynamic.svg?react';
import EthIcon from '@/assets/icons/ethereum.svg?react';
import HealthIcon from '@/assets/icons/health.svg?react';
import StrkIcon from '@/assets/icons/strk.svg?react';
import TelegramIcon from '@/assets/icons/telegram_dashboard.svg?react';
import UsdIcon from '@/assets/icons/usd_coin.svg?react';
import Borrow from '@/components/dashboard/borrow/Borrow';
import Collateral from '@/components/dashboard/collateral/Collateral';
import DashboardTabs from '@/components/dashboard/dashboard-tab/DashboardTabs';
import Deposited from '@/components/dashboard/deposited/Deposited';
import { ActionModal } from '@/components/ui/action-modal';
import Card from '@/components/ui/card/Card';
import { Button } from '@/components/ui/custom-button/Button';
import Spinner from '@/components/ui/spinner/Spinner';
import { useCheckPosition, useClosePosition } from '@/hooks/useClosePosition';
import useDashboardData from '@/hooks/useDashboardData';
import useTelegramNotification from '@/hooks/useTelegramNotification';
import { useWalletStore } from '@/stores/useWalletStore';
import { DASHBOARD_TABS } from '@/utils/constants';
import DashboardLayout from '../DashboardLayout';

export default function DashboardPage({ telegramId }) {
  const { walletId } = useWalletStore();
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const { data, isLoading } = useDashboardData(walletId) || {
    data: { health_ratio: '1.5', current_sum: '0.05', start_sum: '0.04', borrowed: '10.0' },
    isLoading: false,
  };
  const { mutate: closePositionEvent, isLoading: isClosing } = useClosePosition(walletId);
  const { data: positionData } = useCheckPosition();
  const { subscribe } = useTelegramNotification();

  const hasOpenedPosition = positionData?.has_opened_position;
  const { COLLATERAL, BORROW, DEPOSITED } = DASHBOARD_TABS;

  const handleSubscribe = () => subscribe({ telegramId, walletId });

  const [cardData, setCardData] = useState([
    {
      title: 'Collateral & Earnings',
      icon: CollateralIcon,
      balance: '0.00',
      currencyName: 'Ethereum',
      currencyIcon: EthIcon,
    },
    {
      title: 'Borrow',
      icon: BorrowIcon,
      balance: '0.00',
      currencyName: 'USD Coin',
      currencyIcon: UsdIcon,
    },
  ]);

  const [healthFactor, setHealthFactor] = useState('0.00');
  const [startSum, setStartSum] = useState(0);
  const [currentSum, setCurrentSum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(COLLATERAL);
  const [depositedData, setDepositedData] = useState({ eth: 0, strk: 0, usdc: 0, usdt: 0 });

  // ... (keep existing useEffect logic from the previous implementation)

  useEffect(() => {
    console.log('Fetching data for walletId:', walletId);
  }, [walletId]);

  useEffect(() => {
    const getData = async () => {
      if (isLoading) {
        return;
      }
      console.log('Data:', data);

      if (!walletId) {
        console.error('getData: walletId is undefined');
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('Data is missing');
        setLoading(false);
        return;
      }

      const { health_ratio, current_sum, start_sum, borrowed, multipliers, balance, deposit_data } = data;

      // group extra deposits for each token
      const updatedDepositedData = { eth: 0, strk: 0, usdc: 0, usdt: 0 };
      deposit_data.forEach((deposit) => {
        updatedDepositedData[deposit.token.toLowerCase()] += Number(deposit.amount);
      });

      let currencyName = 'Ethereum';
      let currencyIcon = EthIcon;

      if (multipliers) {
        if (multipliers.STRK) {
          currencyName = 'STRK';
          currencyIcon = StrkIcon;
        } else if (multipliers.ETH) {
          currencyName = 'Ethereum';
          currencyIcon = EthIcon;
        } else if (multipliers.USDC) {
          currencyName = 'USDC';
          currencyIcon = UsdIcon;
        }
      }

      // Update card data using the new data structure
      const updatedCardData = [
        {
          title: 'Collateral & Earnings',
          icon: CollateralIcon,
          balance: balance,
          currencyName: currencyName,
          currencyIcon: currencyIcon,
        },
        {
          title: 'Borrow',
          icon: BorrowIcon,
          balance: borrowed,
          currencyName: 'USD Coin',
          currencyIcon: UsdIcon,
        },
      ];

      setCardData(updatedCardData);
      setHealthFactor(health_ratio || '0.00');
      setDepositedData(updatedDepositedData);
      setCurrentSum(current_sum || 0);
      setStartSum(start_sum || 0);
      setLoading(false);
    };

    getData();
  }, [walletId, data, isLoading]);

  const getCurrentSumColor = () => {
    if (currentSum > startSum) return 'current-sum-green';
    if (currentSum < startSum) return 'current-sum-red';
    return '';
  };

  return (
    <DashboardLayout>
      {loading && <Spinner loading={loading} />}
      <div className="top-cards-dashboard">
        <Card label="Health Factor" value={healthFactor} icon={<HealthIcon className="icon" />} />
        <Card label="Borrow Balance" cardData={cardData} icon={<EthIcon className="icon" />} />
      </div>
      <div className="dashboard-info-container">
        <div className="dashboard-info-card">
          <DashboardTabs activeTab={activeTab} switchTab={setActiveTab} />

          {activeTab === COLLATERAL && (
            <Collateral
              getCurrentSumColor={getCurrentSumColor}
              startSum={startSum}
              currentSum={currentSum}
              data={cardData}
            />
          )}

          {activeTab === BORROW && <Borrow data={cardData} />}

          {activeTab === DEPOSITED && <Deposited data={depositedData} />}
        </div>
        <Button
          className="redeem-btn"
          variant="primary"
          size="lg"
          onClick={() => closePositionEvent()}
          disabled={isClosing || !hasOpenedPosition}
        >
          {isClosing ? 'Closing...' : 'Redeem'}
        </Button>
        <Button variant="secondary" size="lg" className="dashboard-btn telegram" onClick={handleOpen}>
          <TelegramIcon className="tab-icon" />
          Enable telegram notification bot
        </Button>
        {showModal && (
          <ActionModal
            isOpen={showModal}
            title="Telegram Notification"
            subTitle="Do you want to enable telegram notification bot?"
            content={[
              'This will allow you to receive quick notifications on your telegram line in realtime. You can disable this setting anytime.',
            ]}
            cancelLabel="Cancel"
            submitLabel="Yes, Sure"
            submitAction={handleSubscribe}
            cancelAction={handleClose}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
