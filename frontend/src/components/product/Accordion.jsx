import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

function Accordion({ label, children, onOpen }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && onOpen) onOpen();
  };

  return (
    <div className="accordion">
      <button className="accordion-header" onClick={toggle}>
        <span className="detail-label">{label}</span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

export default Accordion;
