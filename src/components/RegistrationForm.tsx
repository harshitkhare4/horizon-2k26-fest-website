import React from "react";
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENTS } from '../constants';
import { RegistrationEvent } from '../types';
import { Plus, Trash2, CreditCard, CheckCircle, Loader2, Upload } from 'lucide-react';
import { submitRegistration, uploadPaymentProof } from '../services/firebaseService';
import { QRCodeSVG } from 'qrcode.react';

const schema = z.object({
  fullName: z.string().min(3, 'Name is too short'),
  collegeName: z.string().min(3, 'College name is required'),
  branch: z.string().min(2, 'Branch is required'),
  year: z.string().min(1, 'Year is required'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  events: z.array(z.object({
    eventId: z.string().min(1, 'Select an event'),
    subEventId: z.string().optional(),
    type: z.enum(['solo', 'team']),
    teamName: z.string().optional(),
    teamSize: z.number().min(1).optional(),
    boysCount: z.number().min(0).optional(),
    girlsCount: z.number().min(0).optional(),
    songName: z.string().optional(),
    members: z.array(z.string()).optional(),
    fee: z.number(),
  })).min(1, 'Select at least one event').refine((events) => {
    return events.some(e => e.eventId === 'gate-pass');
  }, {
    message: "Gate Pass is COMPULSORY for entry and participation"
  }),
  transactionId: z.string().min(5, 'Transaction ID is required'),
}).superRefine((data, ctx) => {
  data.events.forEach((eventData, index) => {
    const event = EVENTS.find(e => e.id === eventData.eventId);
    if (!event) return;

    const subEvent = event.subEvents?.find(se => se.id === eventData.subEventId);
    
    if (eventData.eventId === 'dancing' && !eventData.songName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Song name is required for Dancing',
        path: ['events', index, 'songName'],
      });
    }

    if (eventData.type === 'team') {
      if (!eventData.teamName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Team name is required',
          path: ['events', index, 'teamName'],
        });
      }

      const min = subEvent?.minTeamSize || event.minTeamSize;
      const max = subEvent?.maxTeamSize || event.maxTeamSize;
      const size = eventData.teamSize || 0;

      if (min && size < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Minimum ${min} members required`,
          path: ['events', index, 'teamSize'],
        });
      }
      if (max && size > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Maximum ${max} members allowed`,
          path: ['events', index, 'teamSize'],
        });
      }

      const boys = eventData.boysCount || 0;
      const girls = eventData.girlsCount || 0;

      if (boys + girls !== size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Boys + Girls must equal Team Size (${size})`,
          path: ['events', index, 'boysCount'],
        });
      }

      if ((size === 4 || size === 5) && (boys < 1 || girls < 1)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least 1 boy and 1 girl required for 4/5 member teams',
          path: ['events', index, 'boysCount'],
        });
      }

      if (eventData.members) {
        for (let i = 0; i < size; i++) {
          if (!eventData.members[i] || eventData.members[i].trim() === '') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Member ${i + 1} name is required`,
              path: ['events', index, 'members', i],
            });
          }
        }
      }
    }
  });
});

type FormData = z.infer<typeof schema>;

export const RegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ registrationId: string } | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      events: [{ eventId: 'gate-pass', type: 'solo', fee: 100, teamSize: 1, boysCount: 0, girlsCount: 0, songName: '', members: [''] }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "events"
  });

  const watchedEvents = watch("events");

  const calculateTotal = () => {
    return watchedEvents.reduce((acc, curr) => acc + (curr.fee || 0), 0);
  };

  const handleEventChange = (index: number, eventId: string) => {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;

    setValue(`events.${index}.eventId`, eventId);
    setValue(`events.${index}.subEventId`, '');
    
    if (event.isTeamOnly) setValue(`events.${index}.type`, 'team');
    else if (event.isSoloOnly) setValue(`events.${index}.type`, 'solo');
    
    if (event.minTeamSize) setValue(`events.${index}.teamSize`, event.minTeamSize);
    else setValue(`events.${index}.teamSize`, 1);

    updateFee(index);
  };

  const handleSubEventChange = (index: number, subEventId: string) => {
    const eventId = watchedEvents[index].eventId;
    const event = EVENTS.find(e => e.id === eventId);
    const subEvent = event?.subEvents?.find(se => se.id === subEventId);
    
    setValue(`events.${index}.subEventId`, subEventId);
    
    if (subEvent) {
      if (subEvent.isTeamOnly) setValue(`events.${index}.type`, 'team');
      else if (subEvent.isSoloOnly) setValue(`events.${index}.type`, 'solo');
      if (subEvent.minTeamSize) setValue(`events.${index}.teamSize`, subEvent.minTeamSize);
    }
    updateFee(index);
  };

  const updateFee = (index: number) => {
    const eventData = watchedEvents[index];
    const event = EVENTS.find(e => e.id === eventData.eventId);
    if (!event) return;

    let fee = 0;
    if (eventData.type === 'solo') {
      fee = event.soloFee || 0;
    } else {
      fee = event.perMemberFee ? (event.teamFee || 0) * (eventData.teamSize || 1) : (event.teamFee || 0);
    }
    setValue(`events.${index}.fee`, fee);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = async (nextStep: number) => {
    const fieldsToValidate = step === 1 
      ? ['fullName', 'collegeName', 'branch', 'year', 'phoneNumber', 'email'] 
      : ['events'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(nextStep);
    }
  };

  // 🔥 UPDATED ONSUBMIT: No more mandatory screenshot error
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let screenshotUrl = "";

      // Only attempt upload if screenshot exists, else skip silently
      if (screenshot) {
        try {
          screenshotUrl = await uploadPaymentProof(screenshot);
        } catch (uploadErr) {
          console.log("Storage upload skipped/failed:", uploadErr);
        }
      }

      const result = await submitRegistration({
        ...data,
        totalAmount: calculateTotal(),
        paymentScreenshotUrl: screenshotUrl, // Will be empty string if upload skipped
      });

      setSuccessData(result);
      setStep(4);
    } catch (error) {
      console.error(error);
      alert("Registration failed. Please check your internet or contact admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Registration <span className="neon-text">Successful!</span></h2>
          <p className="text-white/70 mb-8 text-lg">Your registration has been received. Please save your Registration ID.</p>
          <div className="bg-white/5 p-6 rounded-2xl mb-8 border border-white/10">
            <p className="text-sm text-white/40 uppercase font-bold mb-1">Registration ID</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-neon-pink">{successData.registrationId}</p>
          </div>
          <button onClick={() => window.location.href = '/'} className="neon-btn w-full py-4 rounded-xl font-bold text-lg">Back to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold">Event <span className="neon-text">Registration</span></h2>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-neon-pink' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass p-8 space-y-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-neon-pink flex items-center justify-center text-sm">1</span> Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Full Name</label><input {...register('fullName')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="John Doe" />{errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}</div>
                <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">College Name</label><input {...register('collegeName')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="College Name" />{errors.collegeName && <p className="text-red-500 text-xs mt-1">{errors.collegeName.message}</p>}</div>
                <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Branch</label><input {...register('branch')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="CSE, ME, etc." />{errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message}</p>}</div>
                <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Year</label><select {...register('year')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all appearance-none"><option value="">Select Year</option><option value="1st Year">1st Year</option><option value="2nd Year">2nd Year</option><option value="3rd Year">3rd Year</option><option value="4th Year">4th Year</option></select>{errors.year && <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>}</div>
                <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Phone Number</label><input {...register('phoneNumber')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="9876543210" />{errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}</div>
                <div className="md:col-span-2"><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Email Address</label><input {...register('email')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="john@example.com" />{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}</div>
              </div>
              <button type="button" onClick={() => handleNextStep(2)} className="neon-btn w-full py-4 rounded-xl font-bold mt-8">Next: Select Events</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass p-8 space-y-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-neon-pink flex items-center justify-center text-sm">2</span> Select Events</h3>
              <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl mb-8"><h4 className="text-red-500 font-black text-xl mb-2 uppercase flex items-center gap-2"><span className="animate-pulse">⚠️</span> Mandatory Gate Pass</h4><p className="text-white/80 text-sm leading-relaxed">A <span className="text-red-500 font-bold">Gate Pass (₹100)</span> is <span className="underline decoration-red-500 font-bold">COMPULSORY</span> for every person entering the fest. Entry will be strictly prohibited without it.</p></div>
              {fields.map((field, index) => {
                const selectedEventId = watchedEvents[index]?.eventId;
                const event = EVENTS.find(e => e.id === selectedEventId);
                return (
                  <div key={field.id} className="p-6 bg-white/5 rounded-2xl border border-white/10 relative">
                    {fields.length > 1 && (<button onClick={() => remove(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"><Trash2 size={20} /></button>)}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2"><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Event</label><select value={selectedEventId} onChange={(e) => handleEventChange(index, e.target.value)} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all"><option value="">Select an Event</option>{EVENTS.map(e => (<option key={e.id} value={e.id}>{e.name} (Day {e.day})</option>))}</select></div>
                      {event?.subEvents && (<div className="md:col-span-2"><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Sub-Event</label><select value={watchedEvents[index]?.subEventId} onChange={(e) => handleSubEventChange(index, e.target.value)} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all"><option value="">Select Sub-Event</option>{event.subEvents.map(se => (<option key={se.id} value={se.id}>{se.name}</option>))}</select></div>)}
                      {event?.id === 'dancing' && (<div className="md:col-span-2"><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Song Name</label><input {...register(`events.${index}.songName`)} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="Enter song name" /></div>)}
                      {watchedEvents[index]?.type === 'team' && (
                        <>
                          <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Team Name</label><input {...register(`events.${index}.teamName`)} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="Team Alpha" /></div>
                          <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Team Size</label><input type="number" {...register(`events.${index}.teamSize`, { valueAsNumber: true })} onChange={(e) => { setValue(`events.${index}.teamSize`, parseInt(e.target.value)); updateFee(index); }} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" /></div>
                          <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Boys</label><input type="number" {...register(`events.${index}.boysCount`, { valueAsNumber: true })} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" /></div>
                            <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Girls</label><input type="number" {...register(`events.${index}.girlsCount`, { valueAsNumber: true })} className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" /></div>
                          </div>
                        </>
                      )}
                      <div className="md:col-span-2 flex justify-end"><div className="text-xl font-bold text-neon-pink">Fee: ₹{watchedEvents[index]?.fee || 0}</div></div>
                    </div>
                  </div>
                );
              })}
              <button type="button" onClick={() => append({ eventId: '', type: 'solo', fee: 0, teamSize: 1, boysCount: 0, girlsCount: 0, songName: '', members: [''] })} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-neon-pink/50 text-white/50 hover:text-white transition-all"><Plus size={20} /> Add Another Event</button>
              <div className="flex gap-4 mt-8"><button type="button" onClick={() => setStep(1)} className="glass flex-1 py-4 rounded-xl font-bold">Back</button><button type="button" onClick={() => handleNextStep(3)} className="neon-btn flex-[2] py-4 rounded-xl font-bold">Next: Payment</button></div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass p-8 space-y-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded-full bg-neon-pink flex items-center justify-center text-sm">3</span> Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10"><p className="text-sm text-white/40 uppercase font-bold mb-1">Total Amount</p><p className="text-5xl font-black text-neon-pink">₹{calculateTotal()}</p></div>
                  <div className="space-y-4 text-white/70">
                    <p className="flex items-center gap-3"><CheckCircle size={18} className="text-green-500" /> Scan QR to pay</p>
                    <p className="flex items-center gap-3"><CheckCircle size={18} className="text-green-500" /> Enter Transaction ID below</p>
                    <p className="flex items-center gap-3"><CheckCircle size={18} className="text-green-500" /> Upload screenshot (Optional)</p>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-bold text-white/50 mb-2 uppercase">Transaction ID / UTR</label><input {...register('transactionId')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all" placeholder="1234567890" />{errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId.message}</p>}</div>
                    <div>
                      <label className="block text-sm font-bold text-white/50 mb-2 uppercase">Payment Screenshot (Optional)</label>
                      <div className="relative">
                        <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" id="screenshot-upload" />
                        <label htmlFor="screenshot-upload" className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                          {screenshotPreview ? <img src={screenshotPreview} className="h-full w-full object-contain p-2" /> : <><Upload size={24} className="text-white/30 mb-2" /><span className="text-sm text-white/30">Click to upload screenshot</span></>}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-2xl">
                  <QRCodeSVG value={`upi://pay?pa=MSBABULALTARABAIINSTITUTEOFRESEARCHTECHNOLOGY.eazypay@icici&pn=Horizon%202k26&am=${calculateTotal()}&cu=INR`} size={200} level="H" />
                  <p className="mt-6 text-black font-bold text-center">Scan to Pay via UPI</p>
                </div>
              </div>
              <div className="flex gap-4 mt-12"><button type="button" onClick={() => setStep(2)} className="glass flex-1 py-4 rounded-xl font-bold">Back</button><button type="submit" disabled={isSubmitting} className="neon-btn flex-[2] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Complete Registration'}</button></div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
};