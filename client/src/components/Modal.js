import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-dark-800 text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]} animate-scale-in`}>
                <div className="bg-white dark:bg-dark-800 px-4 pt-5 pb-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 transition-all duration-200 hover:scale-110 hover:rotate-90"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-2">
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;

