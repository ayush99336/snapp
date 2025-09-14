#[starknet::interface]
trait ICounter<T> {
    fn get_counter(self: @T) -> u32;
    fn increase_counter(ref self: T);
    fn decrease_counter(ref self: T);
    fn set_counter(ref self: T, new_value: u32);
    fn reset_counter(ref self:T);

   

}

#[starknet::contract]
mod CounterContract {
    use super::ICounter;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address};
    use openzeppelin_access::ownable::OwnableComponent;


    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl InternalImpl = OwnableComponent::InternalImpl<ContractState>;

  #[derive(Drop, starknet::Event)]
    #[event]
    enum Event {
        CounterChanged: CounterChanged,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }



  #[derive(Drop, Serde, Copy, starknet::Event)]
    struct CounterChanged {
        #[key]
        caller: ContractAddress,
        old_value: u32,
        new_value: u32,
        reason: ChangeReason,
    }

    #[derive(Drop, Copy, Serde)]
    enum ChangeReason {
        Increase,
        Decrease,
        Reset,
        Set,
    }
    

    #[storage]
    struct Storage {
        counter: u32,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }
#[constructor]
    fn constructor(ref self: ContractState, init_value: u32, owner: ContractAddress) {
        self.counter.write(init_value);
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl ImplCounter of ICounter<ContractState> {
        fn get_counter(self: @ContractState) -> u32 {
            self.counter.read()
        }

        fn increase_counter(ref self: ContractState) {
            let current_counter = self.counter.read();
            let new_counter = current_counter + 1;
            self.counter.write(new_counter);

            self.emit(Event::CounterChanged(CounterChanged {
                caller: get_caller_address(),
                old_value: current_counter,
                new_value: new_counter,
                reason: ChangeReason::Increase,
            }));
        }

        fn decrease_counter(ref self: ContractState) {
            let current_counter = self.counter.read();
            assert!(current_counter > 0, "Counter can't be negative");
            let new_counter = current_counter - 1;
            self.counter.write(new_counter);

            self.emit(Event::CounterChanged(CounterChanged {
                caller: get_caller_address(),
                old_value: current_counter,
                new_value: new_counter,
                reason: ChangeReason::Decrease,
            }));
        }

        fn set_counter(ref self: ContractState, new_value: u32) {
            self.ownable.assert_only_owner();

            let old_counter = self.counter.read();
            self.counter.write(new_value);

            self.emit(Event::CounterChanged(CounterChanged {
                caller: get_caller_address(),
                old_value: old_counter,
                new_value: new_value,
                reason: ChangeReason::Set,
            }));
        }

        fn reset_counter(ref self:ContractState){
            // Simplified reset function without STRK payment for local testing
            // TODO: Add STRK payment logic back for production

            let caller = get_caller_address();
            let old_counter = self.counter.read();
            self.counter.write(0);

            self.emit(Event::CounterChanged(CounterChanged {
                caller: caller,
                old_value: old_counter,
                new_value: 0,
                reason: ChangeReason::Reset,
            }));
        }

       
    }
}