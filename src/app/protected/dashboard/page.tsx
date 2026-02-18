"use client"
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar component
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, addMonths, subMonths, isSameDay, parseISO } from "date-fns";

// Dummy topics array for the 7-day cycle
const topics = [
  "Introduction to OSCE",
  "Assessment",
  "Planning",
  "Implementation",
  "Evaluation",
  "Clinical Skills",
  "Professional Values & Review",
];

// Type for slot data
interface Slot {
  date: Date;
  dayNumber: number;
  topic: string;
}

// WHAT: This component renders the main monthly calendar view with a sidebar.
// It displays a grid of days for the current month, highlighting available slots with "Day X Topic Y".
// Users can click available days to select them, triggering animations and adding to state.
// Sidebar shows the topic legend and fixed time range.

// WHY: Provides a visual interface for browsing and selecting training slots in a cyclical program.
// The repeating 7-day cycle allows flexible booking for rolling batches, accommodating different student start times.
// Color coding (via theme vars) gives quick feedback: secondary for available, primary for selected (temporary highlight), muted/blank for unavailable.

// HOW: Uses Shadcn Calendar with custom day cell modifier for rendering.
// Dummy data generated in useMemo: Creates available slots by iterating month days, skipping most weekends/random days, assigning dayNumber via modulo 7 +1.
// State manages current month and selected slots (array of Slot objects).
// On day click: If available, toggle in selectedSlots with dedupe; animate cell scale/bounce.
// "Review Selections" button opens modal (stubbed for now; will connect in Page 2).
// Micro-interactions: Hover scale/shadow on available cells, click bounce on select.
// Month navigation: Arrows to change month, regenerating dummy data.

export default function MonthlyCalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 9, 1)); // Start with October 2024 (month 9)
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Stub for Page 2 modal

  // Generate dummy available slots for the current month
  const availableSlots = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    const slots: Slot[] = [];

    allDays.forEach((date, index) => {
      // Simulate availability: Skip weekends and every 3rd weekday randomly
      if (isWeekend(date) || (index % 3 === 0 && !isWeekend(date))) return;

      // Cycle dayNumber: 1 to 7 repeating (modulo 7, +1)
      const dayNumber = ((index % 7) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      const topic = topics[dayNumber - 1];

      slots.push({ date, dayNumber, topic });
    });

    return slots;
  }, [currentMonth]);

  // Calendar modifier to customize day cells
  const modifiers = {
    available: availableSlots.map((slot) => slot.date),
    selected: selectedSlots.map((slot) => slot.date),
  };

  const modifierStyles = {
    available: {
      className: "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer",
    },
    selected: {
      className: "bg-primary text-primary-foreground",
    },
    // Default/unavailable: Use muted or blank (no extra class, falls to calendar default which can be styled muted)
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    const slot = availableSlots.find((s) => isSameDay(s.date, date));
    if (!slot) return; // Not available

    // Toggle selection with dedupe
    setSelectedSlots((prev) =>
      prev.some((s) => isSameDay(s.date, date))
        ? prev.filter((s) => !isSameDay(s.date, date))
        : [...prev, slot]
    );
  };

  // Navigation handlers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Main Calendar Area */}
      <div className="flex-1 p-6">
        <Card className="p-4 bg-card text-card-foreground">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
            <Button variant="ghost" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Calendar
            mode="single"
            month={currentMonth}
            onDayClick={handleDayClick}
            modifiers={modifiers}
            modifiersStyles={modifierStyles}
            components={{
              day: ({ date, ...props }) => {
                const slot = availableSlots.find((s) => isSameDay(s.date, date));
                const isSelected = selectedSlots.some((s) => isSameDay(s.date, date));
                const isAvailable = !!slot;

                return (
                  <motion.div
                    key={format(date, "yyyy-MM-dd")}
                    className={`flex flex-col items-center justify-center h-20 w-full rounded-md transition-all ${
                      isAvailable ? "cursor-pointer" : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                    whileHover={isAvailable ? { scale: 1.05, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    animate={isSelected ? { scale: [1, 1.1, 1], transition: { duration: 0.3, ease: "easeInOut" } } : {}}
                    {...props}
                  >
                    <span className="text-sm">{format(date, "d")}</span>
                    {slot && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Day {slot.dayNumber} {slot.topic.slice(0, 10)}...
                      </Badge>
                    )}
                  </motion.div>
                );
              },
            }}
          />
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setIsModalOpen(true)}
              disabled={selectedSlots.length === 0}
              className="bg-primary text-primary-foreground"
            >
              Review Selections ({selectedSlots.length})
            </Button>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="w-64 p-6 border-l border-border bg-sidebar text-sidebar-foreground">
        <h3 className="text-md font-semibold mb-4">Topic Legend</h3>
        <ScrollArea className="h-48">
          <ul className="space-y-2">
            <AnimatePresence>
              {topics.map((topic, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm"
                >
                  Day {index + 1}: {topic}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </ScrollArea>
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Time Range</h3>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2" />
            09:00 hs - 18:00 hs
          </div>
        </div>
      </aside>

      {/* Modal stub - Will be implemented in Page 2 */}
      {isModalOpen && <div>Modal Placeholder - See Page 2</div>}
    </div>
  );
}
