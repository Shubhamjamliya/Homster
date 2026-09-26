import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiStar, FiCalendar, FiArrowUpRight } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';

const StatsCards = memo(({ stats = {} }) => {
  const navigate = useNavigate();

  const totalEarnings = stats.totalEarnings || stats.totalRevenue || 0;
  const monthlyEarnings = stats.monthlyEarnings || Math.round(totalEarnings * 0.4);
  const completedServices = stats.completedServices ?? stats.completedJobs ?? 0;
  const pendingServices = stats.pendingServices ?? ((stats.pendingAlerts || 0) + (stats.activeJobs || 0));
  const avgRating = stats.averageRating || stats.rating || 5.0;

  const topCards = [
    {
      title: 'TOTAL EARNINGS',
      value: `₹${Number(totalEarnings).toLocaleString()}`,
      subtext: 'Lifetime Revenue',
      icon: FaWallet,
      gradient: 'linear-gradient(135deg, #13333d 0%, #1e4d5a 100%)',
      iconBg: 'rgba(214, 143, 53, 0.2)',
      iconColor: 'text-amber-400',
      badgeBorder: 'border-amber-400/30',
      onClick: () => navigate('/vendor/wallet')
    },
    {
      title: 'MONTHLY EARNINGS',
      value: `₹${Number(monthlyEarnings).toLocaleString()}`,
      subtext: 'This Month',
      icon: FiCalendar,
      gradient: 'linear-gradient(135deg, #1a4450 0%, #296877 100%)',
      iconBg: 'rgba(52, 211, 153, 0.2)',
      iconColor: 'text-emerald-400',
      badgeBorder: 'border-emerald-400/30',
      onClick: () => navigate('/vendor/wallet')
    }
  ];

  const subCards = [
    {
      title: 'AVERAGE RATING',
      value: `${Number(avgRating).toFixed(1)} ★`,
      icon: FiStar,
      color: 'text-amber-500',
      badgeBg: 'bg-amber-100/70',
      bg: 'bg-gradient-to-br from-amber-50/80 to-amber-100/30',
      border: 'border-amber-200/70',
      onClick: () => navigate('/vendor/my-ratings')
    },
    {
      title: 'COMPLETED',
      value: completedServices,
      icon: FiCheckCircle,
      color: 'text-emerald-600',
      badgeBg: 'bg-emerald-100/70',
      bg: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/30',
      border: 'border-emerald-200/70',
      onClick: () => navigate('/vendor/jobs?tab=completed')
    },
    {
      title: 'PENDING',
      value: pendingServices,
      icon: FiClock,
      color: 'text-sky-600',
      badgeBg: 'bg-sky-100/70',
      bg: 'bg-gradient-to-br from-sky-50/80 to-sky-100/30',
      border: 'border-sky-200/70',
      onClick: () => navigate('/vendor/booking-alerts')
    }
  ];

  return (
    <div className="px-4 pt-3 space-y-3">
      {/* Top Main Cards: Total & Monthly Earnings */}
      <div className="grid grid-cols-2 gap-3">
        {topCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className="rounded-[22px] p-4 relative overflow-hidden cursor-pointer active:scale-98 transition-all shadow-sm hover:shadow-md border border-white/10"
              style={{ background: card.gradient }}
            >
              {/* Radial Highlight */}
              <div
                className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-15 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
                  transform: 'translate(20px, -20px)',
                }}
              />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black tracking-wider text-teal-200/80 uppercase">
                    {card.title}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center backdrop-blur-md border ${card.badgeBorder}`}
                    style={{ backgroundColor: card.iconBg }}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${card.iconColor}`} />
                  </div>
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                    {card.value}
                  </div>
                  <div className="text-[10px] text-teal-200/70 font-medium mt-1.5 flex items-center justify-between">
                    <span>{card.subtext}</span>
                    <FiArrowUpRight className="w-3 h-3 text-teal-300 opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub Analytics Cards: Rating, Completed, Pending */}
      <div className="grid grid-cols-3 gap-2.5">
        {subCards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className={`rounded-2xl p-3 border ${card.border} ${card.bg} cursor-pointer active:scale-95 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight">
                  {card.title}
                </span>
                <div className={`p-1 rounded-lg ${card.badgeBg}`}>
                  <IconComp className={`w-3 h-3 ${card.color}`} />
                </div>
              </div>
              <div className={`text-lg font-black tracking-tight ${card.color}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

StatsCards.displayName = 'VendorStatsCards';

export default StatsCards;
