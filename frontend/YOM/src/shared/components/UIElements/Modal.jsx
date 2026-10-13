import { createPortal } from "react-dom";
import Backdrop from "./Backdrop";
import { CSSTransition } from "react-transition-group";
import { useRef } from "react";
import './Modal.css'

function ModalOverlay({ nodeRef, ...props }) {
  const content = (
    <div ref={nodeRef} className={`modal ${props.className || ''}`} style={props.style}>
      <header className={`modal__header ${props.headerClass || ''}`}>
        <h2>{props.header}</h2>
      </header>
      <form
        onSubmit={
          props.onSubmit ? props.onSubmit : (event) => event.preventDefault()
        }
      >
        <div className={`modal__content ${props.contentClass || ''}`}>
          {props.children}
        </div>
        <footer className={`modal__footer ${props.footerClass || ''}`}>
          {props.footer}
        </footer>
      </form>
    </div>
  );

  return createPortal(content, document.getElementById("modal-hook"));
}

function Modal(props) {
    const nodeRef = useRef(null);
  return (
    <>
      {props.show && <Backdrop onClick={props.onCancel} />}
      <CSSTransition
        in={props.show}
        mountOnEnter
        unmountOnExit
        timeout={200}
        classNames={'modal'}
        nodeRef={nodeRef}
      >
        <ModalOverlay {...props} nodeRef={nodeRef} />
      </CSSTransition>
    </>
  );
}

export default Modal;
