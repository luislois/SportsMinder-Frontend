// PayPalButton.js
import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Initial options for the PayPal script provider
const initialOptions = {
  clientId:
    "AaLSYUzVAGKqAEGYRA0PCR-OtbNlfJnfKS66vOqbZ_zHeiCHuePbKLaIaKM-saacHqcxEDZ6ccdCnjj0", // Replace with your actual client ID
  currency: "USD", // Replace with the currency you want to use
};

const PayPalButton = ({ amount, onSuccess }) => {
  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then((details) => {
      console.log("Transaction completed by ", details.payer.name.given_name);
      if (onSuccess) onSuccess(details);
    });
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
