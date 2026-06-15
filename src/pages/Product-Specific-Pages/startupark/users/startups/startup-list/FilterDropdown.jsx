import { Fragment} from 'react';
import { Listbox, Transition } from '@headlessui/react';

const FilterDropdown = ({ options, selected, setSelected, label }) => {
  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <div className="w-full md:w-48">
          <Listbox.Label className="sr-only">{label}</Listbox.Label>
          <div className="relative">
            <Listbox.Button className="input-mono relative text-left cursor-default pr-10">
              <span className="block truncate">{selected}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 shadow-lg max-h-60 rounded-xl py-1 text-zinc-900 dark:text-white ring-1 ring-black/5 dark:ring-white/10 overflow-auto focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option}
                    className={({ active }) =>
                      `${active ? 'text-white dark:text-zinc-900 bg-zinc-900 dark:bg-white' : 'text-zinc-900 dark:text-white'}
                      cursor-default select-none relative py-2 pl-3 pr-9`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`${selected ? 'font-semibold' : 'font-normal'} block truncate`}>
                          {option}
                        </span>
                        {selected ? (
                          <span
                            className={`${active ? 'text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-white'}
                              absolute inset-y-0 right-0 flex items-center pr-4`}
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
};

export default FilterDropdown;