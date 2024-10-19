'use client'
import React from 'react'

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
  } from '@tanstack/react-table'
import { useModal } from '@/providers/modal-provider'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CustomModal from '@/components/custom-modal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'

interface DataTableProps<TData, TValue>{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterValue: string
    actionButtonText?: React.ReactNode
    modalChildren?: React.ReactNode
    agencyId: string
    className: string
}



export default function DataTable<TData, TValue>({
    columns,
    data,
    filterValue,
    actionButtonText,
    modalChildren,
    agencyId,
    className
}: DataTableProps<TData,TValue>){
    const { setOpen } = useModal()
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    })
    const router = useRouter()

    return (
        <>
            <div className='flex items-center justify-between'>
                <div className='flex items-center py-4 gap-2'>
                    <Search/>
                    <Input 
                        placeholder='Search Name...'
                        value={
                            (table.getColumn(filterValue)?.getFilterValue() as string) ?? ''
                        }
                        onChange={(event) => {
                            table.getColumn(filterValue)?.setFilterValue(event.target.value)
                        }}
                        className='h-12'
                    />
                </div>
                <Button
                    className={twMerge('flex gap-2', className)}
                    onClick={()=>{
                        if(modalChildren) {
                            setOpen(
                                <CustomModal
                                    title='Add a team member'
                                    subheading='Send an invitation'
                                >
                                    {modalChildren}
                                </CustomModal>
                            )
                        }else{
                            router.push(`http://localhost:3000/agency/${agencyId}/billing`)
                        }
                    }}
                >
                    {modalChildren? actionButtonText : 'Get Unlimited Members'}
                </Button>
            </div>
            <div className='border bg-background rounded-lg'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header)=>{
                                    return(
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                            }
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ): (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    No Results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}