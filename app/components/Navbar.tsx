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
        <div className="navbar h-16 bg-base-100 justify-between text-sm">
            <div className="">
                <Link href='/' className="btn btn-ghost normal-case text-lg flex flex-col ml-1 p-5 h-5" style={{borderRadius: "10px !important"}}>
                    <img alt="" src="/images/logo.png"  style={{maxWidth:"110px", height:"auto", margin: "0.25rem 0 0 0"}}/>
                </Link>
            </div>
            <div className="">
                <ul className="menu menu-horizontal px-1">
                    {!!user ? <>

                        <li className="flex hover:cursor-default">
                            <div className="flex hover:bg-base-100  hover:cursor-default">
                                <img className="w-6 avatar rounded-full" src="https://placeimg.com/80/80/people" />
                                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                    Hi, {user.name.split(' ')[0]}!
                                </span>
                            </div>
                        </li>

                        <li><Link href={DASHBOARD}>Dashboard</Link></li>
                        <li><Link href={HISTORY}>History</Link></li>
                        <li><Link href={LOGOUT}>Logout</Link></li>
                    </> : <div className="">
                            <Link href={GOOGLE_AUTH_START} className='btn btn-sm'>Sign in with Google</Link>
                    </div>}
                </ul>
            </div>
        </div>
    )

}
