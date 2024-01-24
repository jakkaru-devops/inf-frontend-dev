import ContextProvider from './context';
import MessengerContent from './Content';

const Messenger = () => {
  return (
    <ContextProvider>
      <MessengerContent />
    </ContextProvider>
  );
};

export default Messenger;
