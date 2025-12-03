import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Rewards from '../pages/Rewards';
import Account from '../pages/Account';
import Native from '../pages/Native';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/account" element={<Account />} />
      <Route path="/native" element={<Native />} />
    </Routes>
  );
};

export default AppRoutes;

