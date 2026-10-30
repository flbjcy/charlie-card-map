'use client';
import {useRef,useState} from 'react';
import {MessageSquare,X} from 'lucide-react';
const API_BASE=process.env.NEXT_PUBLIC_API_BASE||'';

export default function Feedback(){
 const dialog=useRef<HTMLDialogElement>(null);
 const [category,setCategory]=useState('suggestion'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false);
 function open(){setSent(false);setError('');dialog.current?.showModal();}
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');
  const form=event.currentTarget,data=Object.fromEntries(new FormData(form));
  try{const response=await fetch(API_BASE+'/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw Error(result.error||'Could not save feedback. Please try again.');form.reset();setSent(true);}
  catch(error){setError(error instanceof Error?error.message:'Could not save feedback. Please try again.');}finally{setBusy(false);}
 }
 return <><button className="feedback-button" onClick={open}><MessageSquare size={16}/><span>Feedback</span></button><dialog ref={dialog} className="feedback-dialog"><div className="modal-heading"><h2>Feedback</h2><button type="button" aria-label="Close feedback" onClick={()=>dialog.current?.close()}><X/></button></div>{sent?<div role="status"><p>Thank you! Your feedback has been saved.</p><p className="form-note">Errors and suggestions are reviewed during scheduled updates. Map details change after review.</p><button className="primary submit" onClick={()=>dialog.current?.close()}>Done</button></div>:<form onSubmit={submit}><p className="form-note">Send a suggestion, an error to fix, or other feedback. Feedback is private; please leave out personal information.</p><label>Type<select name="category" value={category} onChange={e=>setCategory(e.target.value)}><option value="suggestion">Suggestion</option><option value="error">Report an error</option><option value="other">Other</option></select></label><label>{category==='error'?'What needs correcting?':'Your feedback'}<textarea name="message" required minLength={3} maxLength={2000} rows={5} placeholder={category==='error'?'For example: Back Bay, purple card. I typed machine 221106, but it should be 221107. Include the report time if you can.':'Tell us what you think…'}/></label><input className="honey" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>{error&&<p role="alert" className="feedback-error">{error}</p>}<button className="primary submit" disabled={busy} type="submit">{busy?'Sending…':'Send feedback'}</button></form>}</dialog></>;
}
