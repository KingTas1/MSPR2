<?php

namespace App\Controller\Admin;

use App\Entity\Media;
use Vich\UploaderBundle\Form\Type\VichFileType;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;

class MediaCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Media::class;
    }


    public function configureFields(string $pageName): iterable
    {
        yield TextField::new('originalName')->onlyOnIndex();
        yield TextField::new('file')->setFormType(VichFileType::class)->onlyOnForms();
        yield IntegerField::new('size')->onlyOnIndex();
    }

}
