import Link from "next/link";
import { GOOGLE_AUTH_START } from "../config/routes";



export const Navbar = () => (
    <div className="flex w-full justify-around">
        <div>Edwiz</div>
        <Link href={GOOGLE_AUTH_START} className='btn'>SignIn with Google</Link>
    </div>

)
