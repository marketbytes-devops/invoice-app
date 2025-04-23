import {
  Menu as MenuIcon,
  ChevronDown as AngleDownIcon,
  Search as SearchIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
  UserCog as UserSettingsIcon,
  Pencil as EditIcon,
  Check as UpdateIcon,
  Trash2 as DeleteIcon,
} from "lucide-react";

export const Menu = () => <MenuIcon size={20} className="text-gray-600" />;
export const AngleDown = () => <AngleDownIcon size={15} className="text-gray-600" />;
export const Search = () => <SearchIcon size={20} className="text-indigo-500" />;
export const User = () => <UserIcon size={20} className="text-gray-600" />;
export const LogOut = () => <LogOutIcon size={20} className="text-red-500" />;
export const UserCog = () => <UserSettingsIcon size={20} className="text-indigo-500" />;
export const Edit = () => <EditIcon size={18} className="text-blue-500" />;
export const Update = () => <UpdateIcon size={18} className="text-green-500" />;
export const Delete = () => <DeleteIcon size={18} className="text-red-500" />;

const Icons = {
  Menu,
  AngleDown,
  Search,
  User,
  LogOut,
  UserCog,
  Edit,
  Update,
  Delete,
};

export default Icons;