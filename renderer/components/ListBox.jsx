import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'

import Down from 'public/icons/arrow-down.svg'

function ListBox({ options, selectedOption, setSelectedOption }) {
  return (
    <Listbox value={selectedOption} onChange={(e) => setSelectedOption(e)}>
      {({ open }) => (
        <>
          <div className="relative text-th-text-primary">
            <ListboxButton className="relative flex justify-between px-5 py-3 w-full bg-th-secondary-10 rounded-lg">
              <span>
                {options?.find((option) => option.value === selectedOption)?.label}
              </span>
              <Down className="w-6 h-6 min-w-[1.5rem] stroke-th-text-primary" />
            </ListboxButton>
            <div className={`-mt-2 pt-5 ${open ? 'bg-th-secondary-10' : ''}`}>
              <ListboxOptions className="absolute w-full max-h-[40vh] bg-th-secondary-10 rounded-b-lg overflow-y-auto z-10">
                {options.map((el) => (
                  <ListboxOption
                    className="relative px-5 py-1 bg-th-secondary-10 cursor-pointer last:pb-3 hover:bg-th-secondary-100"
                    key={el.value}
                    value={el.value}
                  >
                    {el.label}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </div>
        </>
      )}
    </Listbox>
  )
}

export default ListBox
