type ClassCardProps = {
  code: string;
  semester: string;
};

export default function ClassCard({ code, semester }: ClassCardProps) {
  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold">{code}</h2>
      <p>{semester}</p>
    </div>
  );
}