import { DASHBOARD, GOOGLE_AUTH_START, HISTORY, LOGOUT } from "../config/routes";
import { useEffect, useState } from "react";

import { GET_CURRENT_USER } from "../config/api-routes";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "../utils/useAuthStore";

export const Navbar = () => {

    const {setUser, user}=useAuthStore()
    // const [user, setUser]=useState<any>(null)
    useEffect(() => {
        axios.get(GET_CURRENT_USER, {
            withCredentials: true
        }).then(e => setUser(e.data.user))
    }, [])

    return (
        // transparent background color

        <div className="navbar min-h-16 flex-col sm:flex-row justify-between text-sm mt-3 px-5">

            <div className="">
                <Link href='/' className="btn mb-3 btn-ghost normal-case text-lg flex flex-col ml-1 px-6" style={{borderRadius: "5px !important", /* backgroundColor: "rgba(0, 0, 0, .15)" */}}>
                    <img alt="" src="/images/logo.png" className=""  style={{maxWidth:"110px", height:"auto", margin: "0.25rem 0 0 0"}}/>
                </Link>
            </div>
            <div className="">
                <ul className="menu menu-horizontal px-1">
                    {!!user ? <>

                        <li className="flex hover:cursor-default">
                            <div className="flex hover:bg-base-100  hover:cursor-default">
                                <img className="w-6 avatar rounded-full" src={user.picture} />
                                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                    Hi, {user.name.split(' ')[0]}!
                                </span>
                            </div>
                        </li>

                        <li><Link href={DASHBOARD}>Dashboard</Link></li>
                        <li><Link href={HISTORY}>History</Link></li>
                        <li><Link href={LOGOUT}>Logout</Link></li>
                    </> : <div className="">
                            <Link href={GOOGLE_AUTH_START} className='btn btn-sm bg-sky-600 text-white gap-2'><img src="/icons/google.svg" className="h-7"/> Sign in with Google</Link>
                    </div>}
                </ul>
            </div>
        </div>
    )

}
