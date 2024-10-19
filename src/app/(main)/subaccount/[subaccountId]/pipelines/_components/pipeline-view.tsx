'use client'
import LaneForm from '@/components/forms/lane-form'
import CustomModal from '@/components/custom-modal'
import { Button } from '@/components/ui/button'
import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketAndTags,
} from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { Lane, Ticket } from '@prisma/client'
import { Flag, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd'
import PipelineLane from './pipeline-lane'

type Props = {
  lanes: LaneDetail[]
  pipelineId: string
  subaccountId: string
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets
  updateLanesOrder: (lanes: Lane[]) => Promise<void>
  updateTicketsOrder: (tickets: Ticket[]) => Promise<void>
}

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subaccountId,
  updateLanesOrder,
  updateTicketsOrder,
}: Props) => {
  const { setOpen } = useModal()
  const router = useRouter()
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([])

  useEffect(() => {
    setAllLanes(lanes)
  }, [lanes])

  const ticketsFromAllLanes: TicketAndTags[] = []
  lanes.forEach((item) => {
    item.Tickets.forEach((i) => {
      ticketsFromAllLanes.push(i)
    })
  })
  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes)

  const handleAddLane = () => {
    setOpen(
      <CustomModal
        title=" Create A Lane"
        subheading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    )
  }

  const onDragEnd = (dropResult: DropResult) => {
    
    const { destination, source, type } = dropResult
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) { // not dragging new element, dragging same element
      return
    }

    switch (type) {
      case 'lane': {
        const newLanes = [...allLanes]
          .toSpliced(source.index, 1)
          .toSpliced(destination.index, 0, allLanes[source.index])
          .map((lane, idx) => {
            return { ...lane, order: idx }
          }) // refresh local state

        setAllLanes(newLanes)
        updateLanesOrder(newLanes)
      }

      case 'ticket': {
        let newLanes = [...allLanes]
        const originLane = newLanes.find( //original lane
          (lane) => lane.id === source.droppableId
        )
        const destinationLane = newLanes.find( //lane destination
          (lane) => lane.id === destination.droppableId
        )

        if (!originLane || !destinationLane) { // if not valid drop area just return
          return
        }

        if (source.droppableId === destination.droppableId) { // if dropped in the same lane, just change the ticket order
          const newOrderedTickets = [...originLane.Tickets]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, originLane.Tickets[source.index])
            .map((item, idx) => {
              return { ...item, order: idx }
            })
          originLane.Tickets = newOrderedTickets
          setAllLanes(newLanes)
          updateTicketsOrder(newOrderedTickets)
          router.refresh()
        } else { // if dropped in other lane
          const [currentTicket] = originLane.Tickets.splice(source.index, 1) //this ticket

          originLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx
          }) //original lane order

          destinationLane.Tickets.splice(destination.index, 0, {
            ...currentTicket,
            laneId: destination.droppableId,
          }) // put ticket in destination lane

          destinationLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx
          }) // change the destination lane order
          setAllLanes(newLanes) // set all lanes
          updateTicketsOrder([
            ...destinationLane.Tickets,
            ...originLane.Tickets,
          ]) // update ticket order
          router.refresh()
        }
      }
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails?.name}</h1>
          <Button
            className="flex items-center gap-4"
            onClick={handleAddLane}
          >
            <Plus size={15} />
            Create Lane
          </Button>
        </div>
        <Droppable
          droppableId="lanes"
          type="lane"
          direction="horizontal"
          key="lanes"
        >
          {(provided) => (
            <div
              className="flex item-center gap-x-2 overflow-scroll"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex mt-4">
                {allLanes.map((lane, index) => (
                  <PipelineLane
                    allTickets={allTickets}
                    setAllTickets={setAllTickets}
                    subaccountId={subaccountId}
                    pipelineId={pipelineId}
                    tickets={lane.Tickets}
                    laneDetails={lane}
                    index={index}
                    key={lane.id}
                  />
                  
                ))}
              {provided.placeholder}
              </div>
              
            </div>
          )}
        </Droppable>
        {allLanes.length == 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <div className="opacity-100">
              <Flag
                width="100%"
                height="100%"
                className="text-muted-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}

export default PipelineView