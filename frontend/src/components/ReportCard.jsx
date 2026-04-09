const ReportCard = ({ title, value, subtitle, color }) => {
  const colorMap = {
    green: "text-green-600",
    red: "text-red-500",
    yellow: "text-yellow-500",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h4 className="text-gray-500">{title}</h4>

      <p className={`text-2xl font-bold ${colorMap[color]}`}>
        {value}
      </p>

      <span className="text-sm text-gray-400">{subtitle}</span>
    </div>
  );
};

export default ReportCard;