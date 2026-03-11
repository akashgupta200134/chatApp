import { Paperclip, X } from "lucide-react";
import { useState } from "react";

interface MessageInputProps {
    selecteduser : string |null;
    message : string;
    setMessage :(message : string) => void;
    handleMessageSend : (e:any , imageFile?: File | null) => void;
}




export default function MessageInput( {selecteduser , message , setMessage , handleMessageSend}:MessageInputProps) {
     
    const [imageFile , setImageFile] = useState<File | null> (null)
    const [isUploading , setIsUploading] = useState(false);


    const handleSubmit = async (e:any) =>{
        e.preventDefault();
        if(!message.trim() && !imageFile) return

        setIsUploading(true);
         
        await handleMessageSend(e, imageFile);
        setImageFile(null);
        setIsUploading(false);


    }

     if(!selecteduser) return null;
      

    
    return (
       <form action="" onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-gray-700 pt-2">
         {
            imageFile && (
            
            <div className=" relative w-fit">
               <img src= {URL.createObjectURL(imageFile)} alt="preview"  className=" w-24 h-24 object-cover rounded-lg border
                border-gray-600 "/>

                <button type="button" className=" absolute -top-2 -right-2 bg-black rounded-full p-1"
                 onClick={() => setImageFile(null)}>
                    <X className = " w-4 h-4 text-white"/>

                </button>




            </div>
         )}

            <div className=" flex items-center gap-2">
                <label htmlFor="" className=" cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg px-2 py-2 transition-colors ">

                    <Paperclip size={18} className=" text-gray-300 "/>
                    <input type="file" accept="image/*"  className="hidden" onChange={e =>{
                        const file = e.target.files?.[0];
                        if(file && file.type.startsWith("image/")){
                            setImageFile(file);
                        }
                    }} />
                </label>

                 

            </div>

       </form>
    )
}