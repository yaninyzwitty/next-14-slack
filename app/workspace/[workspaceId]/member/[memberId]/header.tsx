import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {FaChevronDown} from "react-icons/fa";

type Props = {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
};
function Header({memberImage, memberName, onClick}: Props) {
  const avatarFallback = memberName?.charAt(0).toUpperCase();
  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden ">
      <Button
        size={"sm"}
        onClick={onClick}
        variant={"ghost"}
        className="text-lg font-semibold px-2 overflow-hidden w-auto"
      >
        <Avatar className="size-6 mr-2">
          <AvatarImage src={memberImage} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate">{memberName}</span>
        <FaChevronDown className="ml-2 size-2.5" />
      </Button>
    </div>
  );
}

export default Header;
