export function TextInputModal({showModal,setShowModal,dataFolder, setDataFolder,submitDataHandler}){
    // const [isModalOpen, setIsModalOpen] = useState(true);
  

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    const handleInputChange = (e) => setDataFolder(e.target.value);
    const handleSubmit = () => {
        console.log("User Input This Folder:", dataFolder);
        closeModal();
        submitDataHandler();
    };

    return (
        <div>
            <button onClick={openModal}>Open Input Window</button>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Enter Some Text</h2>
                        <input
                            type="text"
                            value={dataFolder}
                            onChange={handleInputChange}
                            placeholder="Type here..."
                        />
                        <div>
                            <button onClick={handleSubmit}>Submit</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <style>
                {`
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(0, 0, 0, 0.5);
      }
      .modal-content {
        background: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      button {
        margin: 5px;
      }
    `}
            </style>
        </div>
    );
};
