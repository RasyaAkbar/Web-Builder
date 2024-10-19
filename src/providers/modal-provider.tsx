'use client'

import { TicketDetails } from "@/lib/types"
import { Agency, Contact, Plan, User } from "@prisma/client"
import { createContext, useContext, useEffect, useState } from "react"
import { z } from "zod"


interface ModalProviderProps{
    children : React.ReactNode
}

export type ModalData = {
    user?:User
    agency?:Agency
    ticket?: TicketDetails[0]
    contact?: Contact
    phone?: string | undefined
    plans?: {
        defaultPriceId: Plan
        plans: [{
            id: 'price_1OYxkqFj9oKEERu1KfJGWxgN',
            unit_amount: 199,
            nickname: 'Unlimited Saas',
          }, {
            id: 'price_1OYxkqFj9oKEERu1NbKUxXxN',
            unit_amount: 49,
            nickname: 'Basic',
          }]
      }
}


type ModalContextTyoe = {
    data: ModalData
    isOpen: boolean
    setOpen: (modal: React.ReactNode, fetchData?: ()=> Promise<any>)=> void
    setClose: ()=> void
}

export const ModalContext = createContext<ModalContextTyoe>({
    data: {},
    isOpen: false,
    setOpen: (modal: React.ReactNode, fetchData?: ()=> Promise<any>)=> {},
    setClose: () => {}
})

const ModalProvider: React.FC<ModalProviderProps> = ({ children })=> {
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState<ModalData>({})
    const [showingModal, setShowingModal] = useState<React.ReactNode>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(()=>{
        setIsMounted(true)
    }, [])

    const setOpen = async(
        modal: React.ReactNode,
        fetchData?: () => Promise<any>
    )=>{
        if(modal){
            if(fetchData){
                setData({ ...data, ...(await fetchData())} || {})
            }
            setShowingModal(modal)
            setIsOpen(true)
        }
    }

    const setClose = () => {
        setIsOpen(false)
        setData({})
    }

    if(!isMounted) return null

    return (
        <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
            {children}
            {showingModal}
        </ModalContext.Provider>
    )
}

export const useModal = () =>{
    const context = useContext(ModalContext)
    if(!context){
        throw new Error('useModal must be used within the modal provider')
    }
    return context
}

export default ModalProvider
