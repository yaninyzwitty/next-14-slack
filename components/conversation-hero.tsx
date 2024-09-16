import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
type Props = {
  image?: string;
  name?: string;
};
function ConversationHero({image, name = "Member"}: Props) {
  const fallback = name.charAt(0).toUpperCase();
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <div className="flex items-center gap-x-1 mb-2">
        <Avatar className="size-14 rounded-md mr-2 ">
          <AvatarImage src={image} />
          <AvatarFallback className="bg-sky-500 text-white  font-medium">
            {fallback}
          </AvatarFallback>
        </Avatar>
        <p className="text-2xl font-bold "># {name}</p>
      </div>
      <p className="font-normal text-slate-800 mb-4">
        This conversation is just between you and <strong>{name}</strong>
      </p>
    </div>
  );
}

export default ConversationHero;
