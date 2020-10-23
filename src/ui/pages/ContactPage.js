import React, { useReducer, useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { loadContactsSuccess, loadContactsFailure, startLoadContacts, addContact, addContactFailure, startLoadAddContact } from '../../redux/actions/contactAction/contactActions'
import contactReducer, { contactLastState } from '../../redux/reducers/contactReducer';
import { getAllContacts, createContact } from '../../api/contactApi'
import LoadingIndicator from '../components/LoadingIndicator';
import ContactCard from '../components/CardContact';
import Modal from '../components/Modal/Modal';
import FormContact from '../components/FormContact';
import illustration from '../../assets/undraw_people_search_wctu.svg';


const ContactPage = () => {

  const history = useHistory();
  const [contactState, contactDispatch] = useReducer(contactReducer, contactLastState);
  const [isShowModal, setIsShowModal] = useState(false);
  const [formData, setFormdata] = useState({});

  const handleOpenModal = () => setIsShowModal(true);
  const handleCloseModal = () => setIsShowModal(false);
  const handleClearFormData = () => setFormdata({});

  let mounted = true;

  useEffect(() => {
    getDataContacts();

    return function cleanup() {
      mounted = false;
    }
  }, [])

  // console.log('Contact page');
  // console.log(contactState?.contacts);

  const getDataContacts = async () => {
    if (mounted) contactDispatch(startLoadContacts());

    try {
      const response = await getAllContacts();
      if ((response?.status >= 200 ?? false) && (response?.status < 300 ?? false)) {
        if (mounted) contactDispatch(loadContactsSuccess(response?.data?.data ?? []));
      } else {
        if (mounted) contactDispatch(loadContactsFailure(response?.data?.message ?? 'error occured'));
      }
    } catch(e) {
      console.log(`error getDataContacts:\n${e?.response?.data?.message}`);
      if (mounted) contactDispatch(loadContactsFailure(e?.response?.data?.message ?? e?.message ?? 'error occured'));
    }
  }

  const submitForm = async (objData) => {
    contactDispatch(startLoadAddContact());

    try {
      const response = await createContact(objData);
      if ((response?.status >= 200 ?? false) && (response?.status < 300 ?? false)) {
        contactDispatch(addContact(objData));
        handleCloseModal();
        handleClearFormData();
      }
      else {
        contactDispatch(addContactFailure(response?.data?.message ?? 'error occured'));
      }
      handleClearFormData();
    } catch (error) {
      console.log(`error submitForm:\n${error?.response?.data?.message}`);
      contactDispatch(addContactFailure(error?.response?.data?.message ?? error?.message ?? 'error occured'));
    }
  }

  return (
    <div>
      <h1>Contact Page</h1>
      <div>
        <img height={200} src={illustration} alt='illustration' />
      </div>
      <button onClick={handleOpenModal}>Tambah</button>
      <Modal show={isShowModal} handleClose={handleCloseModal}>
        <h4>Create New Contact</h4>
        <FormContact
          isLoading={contactState?.isLoadingAddContact ?? false}
          onChange={(e) => {
            setFormdata({...formData, [e.target.name]: e.target.value});
          }}
          onSubmit={(e) => {
            e.preventDefault();
            formData.age = parseInt(formData?.age);
            console.log(formData);
            submitForm(formData);
          }} />
      </Modal>

      {contactState?.isLoading 
        ? <div><LoadingIndicator /></div>
        : contactState.contacts.map((contact, idx) => <ContactCard key={idx} contact={contact} onClick={() => history.push(`/contacts/${contact.id}`)} />)}
    </div>
  )
}

export default ContactPage;
