import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Modal from '../components/Modal';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { eventService } from '../services/eventService';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await eventService.getAllEvents({ month, year });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    return days;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];
    
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return (
        (eventStart <= dayEnd && eventEnd >= dayStart) ||
        (dayStart >= eventStart && dayStart <= eventEnd)
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
            <p className="mt-1 text-sm text-gray-500">
              View all school events and important dates
            </p>
          </div>
          <Button icon={CalendarIcon} onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={previousMonth}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-700"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day.date);
              const today = isToday(day.date);

              return (
                <div
                  key={idx}
                  className={`bg-white min-h-[120px] p-2 ${
                    !day.isCurrentMonth ? 'bg-gray-50' : ''
                  } ${today ? 'ring-2 ring-primary-500' : ''}`}
                >
                  {day.date && (
                    <>
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          today
                            ? 'bg-primary-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                            : 'text-gray-900'
                        }`}
                      >
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event._id}
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsDetailModalOpen(true);
                            }}
                            className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                            style={{ backgroundColor: event.color, color: '#fff' }}
                            title={event.title}
                          >
                            <div className="truncate font-medium">{event.title}</div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="ml-2">Academic</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span className="ml-2">Sports</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="ml-2">Cultural</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="ml-2">Holiday</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="ml-2">Exam</span>
            </div>
          </div>
        </div>

        {/* Event Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Event Details"
        >
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Type:</span>
                  <span className="ml-2 capitalize">{selectedEvent.eventType}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="ml-2 capitalize">{selectedEvent.status}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Start:</span>
                  <span className="ml-2">
                    {new Date(selectedEvent.startDate).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">End:</span>
                  <span className="ml-2">
                    {new Date(selectedEvent.endDate).toLocaleString()}
                  </span>
                </div>
                {selectedEvent.venue && (
                  <div>
                    <span className="font-semibold text-gray-700">Venue:</span>
                    <span className="ml-2">{selectedEvent.venue}</span>
                  </div>
                )}
                {selectedEvent.organizer && (
                  <div>
                    <span className="font-semibold text-gray-700">Organizer:</span>
                    <span className="ml-2">{selectedEvent.organizer}</span>
                  </div>
                )}
              </div>

              {selectedEvent.contactPerson?.name && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Contact Person:</p>
                  <p className="text-sm text-gray-700">{selectedEvent.contactPerson.name}</p>
                  {selectedEvent.contactPerson.phone && (
                    <p className="text-sm text-gray-600">📞 {selectedEvent.contactPerson.phone}</p>
                  )}
                  {selectedEvent.contactPerson.email && (
                    <p className="text-sm text-gray-600">✉️ {selectedEvent.contactPerson.email}</p>
                  )}
                </div>
              )}

              {selectedEvent.requiresRegistration && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <p className="text-sm font-semibold text-blue-900">
                    Registration Required
                  </p>
                  {selectedEvent.maxParticipants && (
                    <p className="text-sm text-blue-700">
                      {selectedEvent.registeredParticipants?.length || 0} / {selectedEvent.maxParticipants} registered
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Calendar;

