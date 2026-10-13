import "./UserItem.css";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";

function UserItem(props) {
  return (
    <li className="user-item">
      <Card className="user-item__content">
        <div className="user-item__info">
          <h2>{props.username}</h2>
          {!props.noButton && (
            <Button onClick={props.onClick} disabled={props.disabled}>{props.content}</Button>
          )}

          {props.showAccept && (
            <Button onClick={props.onAccept} disabled={props.disabled}>{props.accept}</Button>
          )}

          {props.showReject && (
            <Button danger onClick={props.onReject} disabled={props.disabled}>{props.reject}</Button>
          )}
        </div>
      </Card>
    </li>
  );
}

export default UserItem;
