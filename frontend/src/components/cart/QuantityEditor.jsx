import { FiMinus, FiPlus, FiCheck } from 'react-icons/fi';

function QuantityEditor({ qty, onChange, onConfirm }) {
  return (
    <div className="qty-editor">
      <button className="qty-btn" onClick={() => onChange(q => Math.max(1, q - 1))}><FiMinus size={12} /></button>
      <span className="qty-value">{qty}</span>
      <button className="qty-btn" onClick={() => onChange(q => q + 1)}><FiPlus size={12} /></button>
      <button className="qty-confirm" onClick={onConfirm}><FiCheck size={13} /></button>
    </div>
  );
}

export default QuantityEditor;
