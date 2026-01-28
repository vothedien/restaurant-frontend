export default function TableCard({ table, onClick }) {
  const isOccupied = table.status === "OCCUPIED";
  const isRequesting = table.status === "REQUESTING_BILL";

  const getStyle = () => {
    if (isRequesting) return { bg: 'var(--mq-orange)', color: '#fff' };
    if (isOccupied) return { bg: 'var(--mq-amber)', color: 'var(--mq-text)' };
    return { bg: '#fff', color: 'var(--mq-text)' };
  };

  const style = getStyle();

  return (
    <div 
      onClick={onClick}
      className="menuCard"
      style={{
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: style.bg,
        border: isOccupied ? 'none' : '1px solid rgba(252, 211, 77, 0.4)'
      }}
    >
      <div className="menuName" style={{ color: style.color, fontSize: '22px' }}>
        {table.code}
      </div>
      <div className="menuBadge" style={{ marginTop: '8px', background: 'rgba(255,255,255,0.4)', border: 'none' }}>
        {table.status}
      </div>
    </div>
  );
}